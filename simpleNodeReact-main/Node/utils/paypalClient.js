require("dotenv").config();
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

// Create PayPal environment based on credentials from .env file
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  // Check that credentials exist, otherwise throw error
  if (!clientId || !clientSecret) {
    throw new Error("PayPal client ID or secret is missing in .env file");
  }

  // Use SandboxEnvironment for testing
  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);

  // For production, use LiveEnvironment instead:
  // return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
}

// Create and return PayPal HTTP client instance with the environment
function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client };
