const express = require("express");
const router = express.Router();
const db = require("../db");
const { client } = require("../utils/paypalClient");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

// POST endpoint to handle user membership purchase after PayPal payment approval
router.post("/", async (req, res) => {
  const { user_id, membership_id, paypal_order_id, payer_id } = req.body;

  // Validate required fields in the request body
  if (!user_id || !membership_id || !paypal_order_id || !payer_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Verify the order status with PayPal to ensure payment was approved/completed
    const request = new checkoutNodeJssdk.orders.OrdersGetRequest(
      paypal_order_id
    );
    const response = await client().execute(request);
    const order = response.result;

    // Check if the PayPal order status is completed or approved
    if (order.status !== "COMPLETED" && order.status !== "APPROVED") {
      return res
        .status(400)
        .json({ error: "Payment not completed or approved" });
    }

    // Fetch membership duration (in days) from database using membership_id
    const durationQuery = `SELECT duration_days FROM membership WHERE membership_id = ?`;
    db.query(durationQuery, [membership_id], (err, results) => {
      if (err || results.length === 0) {
        console.error("Error fetching duration_days:", err);
        return res.status(500).json({ error: "Invalid membership_id" });
      }

      const duration = results[0].duration_days;

      // Insert new record into user_memberships table with start and end dates
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

            // Handle duplicate entry error (if unique constraint violated)
            if (err.code === "ER_DUP_ENTRY") {
              return res.status(409).json({
                error:
                  "This membership has already been purchased for this date",
              });
            }

            // Handle other database errors
            return res.status(500).json({ error: "Database insert error" });
          }

          // Respond with success and inserted record ID
          res.status(201).json({
            message: "Membership purchased successfully",
            id: result.insertId,
          });
        }
      );
    });
  } catch (err) {
    // Handle errors from PayPal verification step
    console.error("PayPal verification error:", err);
    res.status(500).json({ error: "Failed to verify PayPal order" });
  }
});

module.exports = router;
