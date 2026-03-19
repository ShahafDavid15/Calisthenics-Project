/**
 * Creates an admin user in the database.
 *
 * Usage:
 *   node database/create-admin.js
 *
 * Make sure your .env is configured with DB credentials before running.
 */

require("dotenv").config({
  path: require("path").join(__dirname, "../backend/.env"),
});

const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const USERNAME = "admin";
const PASSWORD = "Admin1234"; // Change this before running!

const db = mysql.createConnection({
  host:     process.env.DB_HOST     || "localhost",
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "calisthenics",
});

db.connect((err) => {
  if (err) {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  }

  bcrypt.hash(PASSWORD, 10, (err, hash) => {
    if (err) {
      console.error("Bcrypt error:", err);
      db.end();
      process.exit(1);
    }

    db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, 'admin') ON DUPLICATE KEY UPDATE role = 'admin'",
      [USERNAME, hash],
      (err) => {
        if (err) {
          console.error("Insert failed:", err.message);
        } else {
          console.log(`✓ Admin user created successfully.`);
          console.log(`  Username: ${USERNAME}`);
          console.log(`  Password: ${PASSWORD}`);
          console.log(`  → Change the password after first login!`);
        }
        db.end();
      }
    );
  });
});
