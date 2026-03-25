const db = require("../db");

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

class PurchaseRepository {
  getActiveMembership(userId) {
    return query(
      `SELECT um.*, m.name AS membership_name
       FROM user_membership um
       JOIN membership m ON um.membership_id = m.membership_id
       WHERE um.user_id = ? AND CURDATE() BETWEEN um.start_date AND um.end_date
       ORDER BY um.start_date DESC
       LIMIT 1`,
      [userId]
    ).then((rows) => rows[0] || null);
  }

  getMembershipByName(name) {
    return query(
      "SELECT membership_id, name, duration_days, entry_count, price FROM membership WHERE name = ?",
      [name]
    ).then((rows) => rows[0] || null);
  }

  createUserMembership({ userId, membership_id, duration, paypal_order_id, payer_id }) {
    return query(
      `INSERT INTO user_membership
         (user_id, membership_id, start_date, end_date, paypal_order_id, payer_id, created_at)
       VALUES
         (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, ?, NOW())`,
      [userId, membership_id, duration, paypal_order_id, payer_id]
    );
  }

  getUserEmailInfo(userId) {
    return query(
      "SELECT email, first_name FROM users WHERE user_id = ?",
      [userId]
    ).then((rows) => rows[0] || null);
  }

  getMembershipHistory(userId) {
    return query(
      `SELECT um.id, um.start_date, um.end_date, um.created_at,
              m.name AS membership_name, m.price_with_vat
       FROM user_membership um
       JOIN membership m ON um.membership_id = m.membership_id
       WHERE um.user_id = ?
       ORDER BY um.start_date DESC`,
      [userId]
    );
  }
}

module.exports = new PurchaseRepository();
