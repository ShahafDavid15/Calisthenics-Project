const express = require("express");
const router = express.Router();
const { client } = require("../utils/paypalClient");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

// -------------------------------------
// POST /create-order
// Create a new PayPal order with the specified amount
// Validates the amount is present and a positive number
// -------------------------------------
router.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  console.log("Received create order request:", req.body);

  // Validate amount exists and is a positive number
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    console.warn("Invalid or missing amount");
    return res.status(400).json({ error: "Invalid or missing amount" });
  }

  // Build PayPal order creation request
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "ILS",
          value: parseFloat(amount).toFixed(2),
        },
      },
    ],
  });

  try {
    // Execute the order creation request with PayPal
    const order = await client().execute(request);

    if (!order || !order.result || !order.result.id) {
      throw new Error("Invalid order response from PayPal");
    }

    console.log("Order created with ID:", order.result.id);

    // Return the PayPal order ID to the client
    res.json({ orderID: order.result.id });
  } catch (err) {
    console.error("Error creating order:", err);
    res
      .status(500)
      .json({ error: "Order creation failed", details: err.message });
  }
});

// -------------------------------------
// POST /capture-order
// Capture payment for an existing PayPal order by orderID
// Validates orderID presence and type
// -------------------------------------
router.post("/capture-order", async (req, res) => {
  const { orderID } = req.body;

  console.log("Received capture order request:", req.body);

  // Validate orderID exists and is a string
  if (!orderID || typeof orderID !== "string") {
    console.warn("Missing or invalid orderID");
    return res.status(400).json({ error: "Missing or invalid orderID" });
  }

  // Build PayPal capture request for the specified orderID
  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    // Execute the capture request with PayPal
    const capture = await client().execute(request);

    console.log("Payment captured with ID:", capture.result.id);

    // Return full capture result to client
    res.json(capture.result);
  } catch (err) {
    console.error("Error capturing payment:", err);
    res
      .status(500)
      .json({ error: "Payment capture failed", details: err.message });
  }
});

module.exports = router;
