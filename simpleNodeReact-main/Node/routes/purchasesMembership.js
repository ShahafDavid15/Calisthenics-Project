require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../db");
const { client } = require("../utils/paypalClient");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");
const nodemailer = require("nodemailer");

// Wrap db.query in a Promise
const query = (sql, params) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

// Fixed membership prices for validation only
const MEMBERSHIP_PRICES = {
  Test: 1,
  ש: 100,
  Basic: 127.12,
  Standard: 211.86,
  Premium: 338.98,
};

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// CREATE PAYPAL ORDER
router.post("/create-order", async (req, res) => {
  const { membership_name, price } = req.body;
  console.log("מנוי שנשלח ליצירת הזמנה:", membership_name);
  console.log("מחיר שנשלח ליצירת הזמנה:", price);

  if (!membership_name || !MEMBERSHIP_PRICES[membership_name]) {
    return res.status(400).json({ error: "Invalid membership name" });
  }
  if (!price) {
    return res.status(400).json({ error: "Missing price" });
  }

  try {
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "ILS", value: price },
          description: `Membership: ${membership_name}`,
        },
      ],
    });

    const order = await client().execute(request);
    res.json({ orderID: order.result.id, priceWithVAT: price });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Failed to create PayPal order" });
  }
});

// CAPTURE PAYPAL ORDER
router.post("/capture-order", async (req, res) => {
  const { orderID } = req.body;
  if (!orderID) return res.status(400).json({ error: "Missing orderID" });

  try {
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await client().execute(request);

    if (!capture.result || capture.result.status !== "COMPLETED") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    res.json({ capture });
  } catch (err) {
    console.error("Capture order error:", err);
    res.status(500).json({ error: "Payment capture failed" });
  }
});

// PURCHASE MEMBERSHIP & SEND EMAIL
router.post("/purchase-membership", async (req, res) => {
  const { user_id, membership_name, paypal_order_id, payer_id, price } =
    req.body;
  if (!user_id || !membership_name || !paypal_order_id || !payer_id || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check for active membership
    const activeMembership = await query(
      `SELECT um.*, m.name AS membership_name
       FROM user_membership um
       JOIN membership m ON um.membership_id = m.membership_id
       WHERE um.user_id = ? AND CURDATE() BETWEEN um.start_date AND um.end_date
       LIMIT 1`,
      [user_id]
    );

    if (activeMembership.length) {
      return res.status(409).json({
        error: `יש לך כבר מנוי פעיל: ${activeMembership[0].membership_name}`,
      });
    }

    // Get membership details
    const results = await query(
      "SELECT membership_id, duration_days FROM membership WHERE name = ?",
      [membership_name]
    );

    if (!results.length)
      return res.status(404).json({ error: "Membership not found" });

    const membership_id = results[0].membership_id;
    const duration = results[0].duration_days;

    // Insert membership for user
    const insertQuery = `
      INSERT INTO user_membership 
        (user_id, membership_id, start_date, end_date, paypal_order_id, payer_id, created_at)
      VALUES 
        (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, ?, NOW())
    `;
    const result = await query(insertQuery, [
      user_id,
      membership_id,
      duration,
      paypal_order_id,
      payer_id,
    ]);

    // Send confirmation email
    const userRows = await query("SELECT email FROM users WHERE user_id = ?", [
      user_id,
    ]);
    if (userRows.length && userRows[0].email) {
      const userEmail = userRows[0].email;
      const mailOptions = {
        from: `"Calisthenics Website" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "קבלה על רכישת מנוי",
        html: `
          <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif; color: #333;">
            <h2>תודה על רכישת מנוי!</h2>
            <p>שלום, הרכישה שלך נקלטה בהצלחה.</p>
            <p><b>מנוי:</b> ${membership_name}</p>
            <p><b>מחיר (כולל מע"מ):</b> ₪${price}</p>
            <p><b>תאריך התחלה:</b> ${new Date().toLocaleDateString("he-IL")}</p>
            <p><b>תאריך סיום:</b> ${new Date(
              new Date().setDate(new Date().getDate() + duration)
            ).toLocaleDateString("he-IL")}</p>
            <p><b>מספר הזמנה (PayPal):</b> ${paypal_order_id}</p>
            <br/>
            <p>תודה שבחרת בנו 🙏</p>
          </div>
        `,
      };
      try {
        await transporter.sendMail(mailOptions);
      } catch (mailErr) {
        console.error("Mail error:", mailErr);
      }
    }

    res.status(201).json({
      message: "Membership purchased successfully",
      id: result.insertId,
      priceWithVAT: price,
    });
  } catch (err) {
    console.error("Purchase membership error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// GET ACTIVE MEMBERSHIP BY USER
router.get("/active-membership", async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  try {
    const results = await query(
      `SELECT um.*, m.name AS membership_name
       FROM user_membership um
       JOIN membership m ON um.membership_id = m.membership_id
       WHERE um.user_id = ? AND CURDATE() BETWEEN um.start_date AND um.end_date
       ORDER BY um.start_date DESC
       LIMIT 1`,
      [user_id]
    );

    if (!results.length) return res.json(null);
    res.json(results[0]);
  } catch (err) {
    console.error("Fetch active membership error:", err);
    res.status(500).json({ error: "Failed to fetch active membership" });
  }
});

module.exports = router;
