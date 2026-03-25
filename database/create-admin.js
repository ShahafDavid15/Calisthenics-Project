/**
 * Creates an admin user in the database.
 *
 * Usage:
 *   node database/create-admin.js
 *
 * Make sure your .env is configured with DB credentials before running.
 */

const path = require("path");
const backendDir = path.join(__dirname, "..", "backend");
// Load deps from backend (script is run from repo root; root has no dotenv/mysql2)
require(path.join(backendDir, "node_modules", "dotenv")).config({
  path: path.join(backendDir, ".env"),
});
const mysql = require(path.join(backendDir, "node_modules", "mysql2"));
const bcrypt = require(path.join(backendDir, "node_modules", "bcrypt"));

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

  // Only the canonical `admin` account may have role admin (signup cannot create admins).
  db.query(
    "UPDATE users SET role = 'user' WHERE role = 'admin' AND LOWER(TRIM(username)) <> ?",
    [USERNAME.toLowerCase()],
    (err, demoteResult) => {
      if (err) {
        console.error("Demote extra admins failed:", err.message);
        db.end();
        process.exit(1);
      }
      if (demoteResult.affectedRows > 0) {
        console.log(
          `Note: demoted ${demoteResult.affectedRows} user(s) from admin to user (only '${USERNAME}' may be admin).`
        );
      }

      runUpsertAdmin();
    }
  );

  function runUpsertAdmin() {
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
  }
});
