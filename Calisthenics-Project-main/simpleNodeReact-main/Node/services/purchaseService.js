const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");
const { client } = require("../utils/paypalClient");
const { sendEmail } = require("../utils/sendEmail");
const purchaseRepository = require("../repositories/purchaseRepository");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

/** Membership names allowed for PayPal orders */
const VALID_MEMBERSHIPS = ["Basic", "Standard", "Premium"];

class PurchaseService {
  async createPaypalOrder(membership_name, price) {
    if (!membership_name || !VALID_MEMBERSHIPS.includes(membership_name)) {
      throw new AppError("שם מנוי לא תקין", 400);
    }
    if (!price) {
      throw new AppError("חסר מחיר", 400);
    }

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
    return { orderID: order.result.id, priceWithVAT: price };
  }

  async capturePaypalOrder(orderID) {
    if (!orderID) {
      throw new AppError("חסר מזהה הזמנה", 400);
    }

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await client().execute(request);

    if (!capture.result || capture.result.status !== "COMPLETED") {
      throw new AppError("התשלום לא הושלם", 400);
    }
    return { capture: capture.result };
  }

  async purchaseMembership(userId, { membership_name, paypal_order_id, payer_id, price }) {
    if (!membership_name || !paypal_order_id || !payer_id || !price) {
      throw new AppError("חסרים שדות חובה", 400);
    }

    const active = await purchaseRepository.getActiveMembership(userId);
    if (active) {
      throw new AppError(`יש לך כבר מנוי פעיל: ${active.membership_name}`, 409);
    }

    const membership = await purchaseRepository.getMembershipByName(membership_name);
    if (!membership) {
      throw new AppError("המנוי לא נמצא", 404);
    }

    const result = await purchaseRepository.createUserMembership({
      userId,
      membership_id: membership.membership_id,
      duration: membership.duration_days,
      paypal_order_id,
      payer_id,
    });

    // Send confirmation email (non-blocking)
    this._sendConfirmationEmail(userId, {
      membership_name,
      price,
      duration: membership.duration_days,
      paypal_order_id,
    }).catch((err) => console.error("Email send failed:", err.message));

    return {
      message: "המנוי נרכש בהצלחה",
      id: result.insertId,
      priceWithVAT: price,
    };
  }

  async getActiveMembership(userId) {
    return purchaseRepository.getActiveMembership(userId);
  }

  async _sendConfirmationEmail(userId, { membership_name, price, duration, paypal_order_id }) {
    const user = await purchaseRepository.getUserEmailInfo(userId);
    if (!user?.email) return;

    const startDate = new Date().toLocaleDateString("he-IL");
    const endDate = new Date(
      new Date().setDate(new Date().getDate() + duration)
    ).toLocaleDateString("he-IL");

    const html = `
      <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif; color: #333;">
        <h2>תודה על רכישת מנוי!</h2>
        <p>שלום ${user.first_name || ""}, הרכישה שלך נקלטה בהצלחה.</p>
        <p><b>מנוי:</b> ${membership_name}</p>
        <p><b>מחיר (כולל מע"מ):</b> ₪${price}</p>
        <p><b>תאריך התחלה:</b> ${startDate}</p>
        <p><b>תאריך סיום:</b> ${endDate}</p>
        <p><b>מספר הזמנה (PayPal):</b> ${paypal_order_id}</p>
        <br/>
        <p>תודה שבחרת בנו!</p>
      </div>
    `;

    await sendEmail(user.email, "קבלה על רכישת מנוי", html);
  }
}

module.exports = { purchaseService: new PurchaseService(), AppError };
