/**
 * This module handles the connection to the MySQL database.
 * Uses a connection pool for better concurrency.
 * Credentials from env: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
 */

require("dotenv").config();
const mysql = require("mysql2");
const logger = require("./utils/logger");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "calisthenics",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection((err, conn) => {
  if (err) {
    logger.error("MySQL connection error: " + err.message);
  } else {
    logger.info("Connected to MySQL database (pool).");
    conn.release();
  }
});

module.exports = pool;
