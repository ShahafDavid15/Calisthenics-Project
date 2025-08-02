const express = require("express");
const router = express.Router();
const db = require("../db");
const { client } = require("../utils/paypalClient");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

router.post("/", async (req, res) => {
  const { user_id, membership_id, paypal_order_id, payer_id } = req.body;

  if (!user_id || !membership_id || !paypal_order_id || !payer_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // אימות הזמנה מול PayPal
    const request = new checkoutNodeJssdk.orders.OrdersGetRequest(
      paypal_order_id
    );
    const response = await client().execute(request);
    const order = response.result;

    if (order.status !== "COMPLETED" && order.status !== "APPROVED") {
      return res
        .status(400)
        .json({ error: "Payment not completed or approved" });
    }

    // שליפת משך המנוי מה-DB
    const durationQuery = `SELECT duration_days FROM membership WHERE membership_id = ?`;
    db.query(durationQuery, [membership_id], (err, results) => {
      if (err || results.length === 0) {
        console.error("Error fetching duration_days:", err);
        return res.status(500).json({ error: "Invalid membership_id" });
      }

      const duration = results[0].duration_days;

      // הוספת המנוי בטבלת user_memberships
      const insertQuery = `
        INSERT INTO user_memberships (user_id, membership_id, start_date, end_date, paypal_order_id, payer_id)
        VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, ?)
      `;

      db.query(
        insertQuery,
        [user_id, membership_id, duration, paypal_order_id, payer_id],
        (err, result) => {
          if (err) {
            console.error("Error inserting user_membership:", err);
            if (err.code === "ER_DUP_ENTRY") {
              return res
                .status(409)
                .json({ error: "כבר נרכש מנוי זה בתאריך זה" });
            }
            return res.status(500).json({ error: "Database insert error" });
          }

          res
            .status(201)
            .json({ message: "המנוי נרכש בהצלחה", id: result.insertId });
        }
      );
    });
  } catch (err) {
    console.error("PayPal verification error:", err);
    res.status(500).json({ error: "Failed to verify PayPal order" });
  }
});

module.exports = router;
