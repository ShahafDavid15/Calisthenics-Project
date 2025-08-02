const mysql = require("mysql2");

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "calisthenics",
});

// Connect to the database and handle connection errors
db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err.message);
  } else {
    console.log("Connected to MySQL database.");
  }
});

module.exports = db;
