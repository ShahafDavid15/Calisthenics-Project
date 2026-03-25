const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");
const { client, getPayPalCurrency } = require("../utils/paypalClient");
const { sendEmail } = require("../utils/sendEmail");
const logger = require("../utils/logger");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const VAT_PERCENT = 18;

function expectedPriceWithVat(basePrice) {
  return Math.round(Number(basePrice) * (1 + VAT_PERCENT / 100));
}

/** PayPal expects amount.value as a decimal string (e.g. "150.00"). */
function paypalAmountString(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n.toFixed(2);
}

function mapPayPalFailureToMessage(err) {
  const raw = err?.message || String(err);
  const debugHint = (id) => (id ? ` [debug_id: ${id}]` : "");

  try {
    const body = JSON.parse(raw);

    // OAuth / token errors (different JSON shape than Orders API)
    if (body.error && typeof body.error === "string") {
      const oauthMsg =
        body.error_description ||
        body.error_uri ||
        body.error;
      return `PayPal: ${oauthMsg}${debugHint(body.debug_id)}`;
    }

    const details = Array.isArray(body.details) ? body.details : [];
    const detailParts = details
      .map((d) => {
        if (!d || typeof d !== "object") return null;
        const bits = [d.issue, d.field, d.description].filter(Boolean);
        return bits.length ? bits.join(" — ") : null;
      })
      .filter(Boolean);

    const issues = details.map((d) => d?.issue).filter(Boolean);
    const issue = issues[0] || body.name;
    const desc = details[0]?.description;

    if (issue === "CURRENCY_NOT_ALLOWED" || issue === "INVALID_CURRENCY")
      return "המטבע לא נתמך בחשבון PayPal זה. נסה PAYPAL_CURRENCY=USD או ILS ב-.env והפעל מחדש." + debugHint(body.debug_id);
    if (issue === "INVALID_STRING_LENGTH" || issue === "AMOUNT_MISMATCH")
      return "סכום לא תקין לפי PayPal." + debugHint(body.debug_id);
    if (
      issue === "AUTHENTICATION_FAILURE" ||
      body.name === "AUTHENTICATION_FAILURE"
    )
      return "אימות PayPal נכשל — ודא PAYPAL_CLIENT_ID ו-PAYPAL_CLIENT_SECRET מאותה אפליקציה (Sandbox, לא Live)." + debugHint(body.debug_id);
    if (
      String(body.name || "").includes("NOT_AUTHORIZED") ||
      issue === "PERMISSION_DENIED"
    )
      return "אין הרשאה ל-PayPal — בדוק PAYPAL_ENV=sandbox ומפתחות Sandbox." + debugHint(body.debug_id);
    if (
      issue === "PAYEE_ACCOUNT_RESTRICTED" ||
      issue === "PAYEE_ACCOUNT_INVALID"
    )
      return "חשבון הסוחר ב-Sandbox לא מוכן לקבל תשלומים — ב-PayPal Developer: Sandbox accounts → ודא שחשבון Business פעיל, או צור אפליקציית REST חדשה." + debugHint(body.debug_id);

    const apiMessage =
      (typeof body.message === "string" && body.message.trim()) || "";
    const namePart = body.name ? String(body.name) : "";
    const base =
      apiMessage ||
      detailParts.join(" | ") ||
      namePart ||
      issue ||
      "שגיאה מ-PayPal";
    const suffix = desc && !apiMessage.includes(desc) ? ` (${desc})` : "";
    return `${base}${suffix}${debugHint(body.debug_id)}`;
  } catch {
    if (/401|Authentication/i.test(raw))
      return "התחברות ל-PayPal נכשלה — בדוק מפתחות Sandbox ו-PAYPAL_ENV.";
    return raw.length > 500 ? `${raw.slice(0, 500)}…` : raw;
  }
}

function httpStatusForPayPalError(err) {
  const code = err?.statusCode;
  if (typeof code === "number" && code >= 400 && code < 500) return 400;
  return 502;
}

class PurchaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async createPaypalOrder(membership_name, price) {
    if (!membership_name) {
      throw new AppError("חסר שם מנוי", 400);
    }

    const membership = await this.repository.getMembershipByName(membership_name);
    if (!membership) {
      throw new AppError("שם מנוי לא תקין", 400);
    }

    const expectedVat = expectedPriceWithVat(membership.price);
    const clientPrice = Number(price);
    const priceOk =
      Number.isFinite(clientPrice) &&
      (Math.abs(clientPrice - expectedVat) < 0.02 ||
        Math.round(clientPrice) === expectedVat);
    if (!priceOk) {
      throw new AppError("מחיר לא תואם למנוי", 400);
    }

    const valueStr = paypalAmountString(clientPrice);
    if (!valueStr) {
      throw new AppError("חסר מחיר", 400);
    }

    const currency = getPayPalCurrency();

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    // Minimal body — extra application_context fields have caused schema/422 errors with some accounts
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: currency, value: valueStr },
          description: `Membership: ${membership_name}`,
        },
      ],
    });

    try {
      const order = await client().execute(request);
      return { orderID: order.result.id, priceWithVAT: clientPrice };
    } catch (err) {
      logger.error("PayPal create order failed", {
        currency,
        membership_name,
        statusCode: err?.statusCode,
        paypalMessage: err?.message?.slice?.(0, 4000),
      });
      const msg = mapPayPalFailureToMessage(err);
      throw new AppError(msg, httpStatusForPayPalError(err));
    }
  }

  async capturePaypalOrder(orderID) {
    if (!orderID) {
      throw new AppError("חסר מזהה הזמנה", 400);
    }

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    try {
      const capture = await client().execute(request);

      if (!capture.result || capture.result.status !== "COMPLETED") {
        throw new AppError("התשלום לא הושלם", 400);
      }
      return { capture: capture.result };
    } catch (err) {
      if (err instanceof AppError) throw err;
      logger.error("PayPal capture failed", {
        orderID,
        statusCode: err?.statusCode,
        paypalMessage: err?.message?.slice?.(0, 4000),
      });
      throw new AppError(
        mapPayPalFailureToMessage(err),
        httpStatusForPayPalError(err)
      );
    }
  }

  async purchaseMembership(userId, { membership_name, paypal_order_id, payer_id, price }) {
    if (!membership_name || !paypal_order_id || price == null || price === "") {
      throw new AppError("חסרים שדות חובה", 400);
    }
    const payerRef = payer_id != null && String(payer_id).trim() !== ""
      ? String(payer_id).trim()
      : "n/a";

    const active = await this.repository.getActiveMembership(userId);
    if (active) {
      throw new AppError(`יש לך כבר מנוי פעיל: ${active.membership_name}`, 409);
    }

    const membership = await this.repository.getMembershipByName(membership_name);
    if (!membership) {
      throw new AppError("המנוי לא נמצא", 404);
    }

    const result = await this.repository.createUserMembership({
      userId,
      membership_id: membership.membership_id,
      duration: membership.duration_days,
      paypal_order_id,
      payer_id: payerRef,
    });

    this._sendConfirmationEmail(userId, {
      membership_name,
      price,
      duration: membership.duration_days,
      entry_count: membership.entry_count,
      paypal_order_id,
    }).catch((err) =>
      logger.error("Membership receipt email failed", {
        userId,
        err: err.message,
      })
    );

    return {
      message: "המנוי נרכש בהצלחה",
      id: result.insertId,
      priceWithVAT: price,
    };
  }

  async getActiveMembership(userId) {
    return this.repository.getActiveMembership(userId);
  }

  async getMembershipHistory(userId) {
    return this.repository.getMembershipHistory(userId);
  }

  async _sendConfirmationEmail(userId, {
    membership_name,
    price,
    duration,
    entry_count,
    paypal_order_id,
  }) {
    const user = await this.repository.getUserEmailInfo(userId);
    if (!user?.email?.trim()) {
      logger.warn("Membership receipt skipped: user has no email", { userId });
      return;
    }

    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + Number(duration));
    const startDate = start.toLocaleDateString("he-IL");
    const endDate = end.toLocaleDateString("he-IL");
    const entriesLine =
      entry_count != null
        ? `<p><b>מספר כניסות לאימונים בתקופה:</b> ${entry_count}</p>`
        : "";

    const html = `
      <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif; color: #333; max-width: 520px;">
        <h2 style="margin-top:0;">קבלה — רכישת מנוי</h2>
        <p>שלום ${user.first_name || "לקוח יקר"},</p>
        <p>הרכישה נרשמה במערכת. זוהי קבלה לתיעוד.</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:16px 0;" />
        <p><b>סוג מנוי:</b> ${membership_name}</p>
        <p><b>מחיר ששולם (כולל מע"מ):</b> ₪${price}</p>
        <p><b>תקופת מנוי:</b> ${duration} ימים</p>
        ${entriesLine}
        <p><b>תאריך תחילת מנוי:</b> ${startDate}</p>
        <p><b>תאריך סיום מנוי:</b> ${endDate}</p>
        <p><b>מזהה הזמנה PayPal:</b> ${paypal_order_id}</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:16px 0;" />
        <p style="color:#666;font-size:14px;">תודה שבחרת ב-Calisthenics!</p>
      </div>
    `;

    await sendEmail(
      user.email.trim(),
      "קבלה על רכישת מנוי — Calisthenics",
      html
    );
  }
}

module.exports = { PurchaseService, AppError };
