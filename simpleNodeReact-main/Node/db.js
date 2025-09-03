/**
 * This module handles the connection to the MySQL database.
 * It creates and exports a single `db` object that can be used
 * to execute queries from other modules.
 *
 * Connection details:
 * - host: database server address
 * - user: database username
 * - password: database password
 * - database: the name of the database
 *
 * On connection, it logs success or any error encountered.
 */

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "calisthenics",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err.message);
  } else {
    console.log("Connected to MySQL database.");
  }
});

module.exports = db;
