/**
 * This module sets up a PayPal client for interacting with PayPal APIs.
 *  Selects environment based on PAYPAL_ENV
 *  Reads credentials from environment variables
 *  Exports a client function to create a PayPal SDK client
 */

const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

/**
 * Selects the PayPal environment (Sandbox or Live)
 * based on the PAYPAL_ENV environment variable.
 */
const environment = () => {
  const env = process.env.PAYPAL_ENV || "sandbox";
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  // Check if client ID and secret are provided
  if (!clientId || !clientSecret) {
    throw new Error(
      "PayPal client ID or secret missing in .env. Check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET"
    );
  }

  // Return the appropriate environment object for the SDK
  if (env === "live") {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new checkoutNodeJssdk.core.SandboxEnvironment(
      clientId,
      clientSecret
    );
  }
};

/**
 * Creates a PayPal client using the selected environment.
 * This client is used to execute requests such as order creation and capture.
 */
const client = () => new checkoutNodeJssdk.core.PayPalHttpClient(environment());

module.exports = { client };
