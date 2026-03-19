const db = require("../db");

class UserRepository {
  findUserByUsername(username) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0] || null);
        }
      );
    });
  }

  createUser({ username, passwordHash }) {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, passwordHash],
        (err, result) => {
          if (err) return reject(err);
          resolve({
            insertId: result.insertId,
          });
        }
      );
    });
  }

  findUserById(userId) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE user_id = ?",
        [userId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0] || null);
        }
      );
    });
  }

  getAllUsersWithLatestMembership() {
    const sql = `
      SELECT 
        u.user_id,
        u.username,
        u.email,
        m.name AS membership_type,
        um.start_date,
        um.end_date
      FROM users u
      LEFT JOIN user_membership um 
        ON um.user_id = u.user_id
        AND um.end_date = (
          SELECT MAX(um2.end_date)
          FROM user_membership um2
          WHERE um2.user_id = u.user_id
        )
      LEFT JOIN membership m 
        ON um.membership_id = m.membership_id
      ORDER BY u.user_id;
    `;

    return new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  updateUserProfile({
    username,
    firstName,
    lastName,
    phone,
    email,
    birthDate,
    gender,
  }) {
    const sql = `
      UPDATE users 
      SET first_name = ?, last_name = ?, phone = ?, email = ?, birth_date = ?, gender = ?
      WHERE username = ?
    `;

    return new Promise((resolve, reject) => {
      db.query(
        sql,
        [firstName, lastName, phone, email, birthDate || null, gender, username],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  }

  findUserByEmail(email) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0] || null);
        }
      );
    });
  }

  updateUserPasswordById(userId, passwordHash) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET password = ? WHERE user_id = ?",
        [passwordHash, userId],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  }

  updateUserPasswordByUsername(username, passwordHash) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET password = ? WHERE username = ?",
        [passwordHash, username],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  }

  getUsernameByEmail(email) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT username FROM users WHERE email = ?",
        [email],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0] || null);
        }
      );
    });
  }
}

module.exports = new UserRepository();