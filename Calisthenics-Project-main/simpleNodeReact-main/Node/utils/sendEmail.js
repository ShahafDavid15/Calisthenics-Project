/**
 * This module handles email notifications for the Calisthenics system
 * Sends emails via Gmail
 * notifyExpiringMemberships - checks memberships expiring within 3 days
 * (Cron is scheduled in app.js)
 */

require("dotenv").config();
const nodemailer = require("nodemailer");
const db = require("../db");

// Create a Gmail transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/** Sends an email to a specific recipient. */
async function sendEmail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: `"Calisthenics Website" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error(`Error sending email to ${to}:`, err);
  }
}

/**
 * notifyExpiringMemberships
 * Checks the database for memberships expiring within 3 days
 * and sends an email notification to the users.
 * The expiration date is formatted as DD/MM/YYYY.
 */
async function notifyExpiringMemberships() {
  try {
    const [rows] = await db.promise().execute(
      `SELECT um.user_id, 
              DATE_FORMAT(um.end_date, '%d/%m/%Y') AS formatted_end_date, 
              u.email, u.first_name, u.last_name
       FROM user_membership um
       JOIN users u ON um.user_id = u.user_id
       WHERE DATE(um.end_date) >= CURDATE()
         AND DATE(um.end_date) <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)`
    );

    for (const user of rows) {
      const subject = "התראת סיום מנוי";
      const text = `שלום ${user.first_name} ${user.last_name},\n\nהמנוי שלך מסתיים בתאריך ${user.formatted_end_date}.\nאנא חדש את המנוי בהקדם על מנת להירשם לאימונים.\n\nתודה,\nצוות Calisthenics`;

      await sendEmail(user.email, subject, text);
    }
  } catch (err) {
    console.error("Error checking memberships:", err);
  }
}

module.exports = { sendEmail, notifyExpiringMemberships };
