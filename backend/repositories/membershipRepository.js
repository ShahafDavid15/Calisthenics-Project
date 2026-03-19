const db = require("../db");

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

class MembershipRepository {
  getAll() {
    return query(`
      SELECT membership_id, name, price, price_with_vat, duration_days, entry_count
      FROM membership
      ORDER BY price ASC
    `);
  }

  create({ name, price, priceWithVat, duration_days, entry_count }) {
    return query(
      `INSERT INTO membership (name, price, price_with_vat, duration_days, entry_count)
       VALUES (?, ?, ?, ?, ?)`,
      [name, price, priceWithVat, duration_days, entry_count]
    );
  }

  update(id, { name, price, priceWithVat, duration_days, entry_count }) {
    return query(
      `UPDATE membership
       SET name = ?, price = ?, price_with_vat = ?, duration_days = ?, entry_count = ?
       WHERE membership_id = ?`,
      [name, price, priceWithVat, duration_days, entry_count, id]
    );
  }

  deleteById(id) {
    return query("DELETE FROM membership WHERE membership_id = ?", [id]);
  }
}

module.exports = new MembershipRepository();
