const express = require("express");
const router = express.Router();
const { client } = require("../utils/paypalClient");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

// יצירת הזמנה
router.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  console.log("בקשת יצירת הזמנה התקבלה:", req.body);

  if (!amount || isNaN(amount)) {
    console.warn("סכום לא תקין או חסר");
    return res.status(400).json({ error: "סכום לא תקין או חסר" });
  }

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
    const order = await client().execute(request);
    console.log("הזמנה נוצרה:", order.result.id);
    res.json({ orderID: order.result.id });
  } catch (err) {
    console.error("שגיאה ביצירת הזמנה:", err.message);
    res.status(500).json({ error: "יצירת ההזמנה נכשלה" });
  }
});

// אישור תשלום
router.post("/capture-order", async (req, res) => {
  const { orderID } = req.body;

  console.log("בקשת אישור תשלום:", req.body);

  if (!orderID || typeof orderID !== "string") {
    console.warn("מזהה הזמנה חסר או לא תקין");
    return res.status(400).json({ error: "מזהה הזמנה חסר או לא תקין" });
  }

  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client().execute(request);
    console.log("תשלום אושר:", capture.result.id);
    res.json(capture.result);
  } catch (err) {
    console.error("שגיאה באישור תשלום:", err.message);
    res.status(500).json({ error: "אישור התשלום נכשל" });
  }
});

module.exports = router;
