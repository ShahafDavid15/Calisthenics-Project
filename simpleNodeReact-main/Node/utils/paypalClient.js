// utils/paypalClient.js
require("dotenv").config();
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal client ID or secret is missing in .env file");
  }

  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
  // ל-production:
  // return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
}

function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client };
