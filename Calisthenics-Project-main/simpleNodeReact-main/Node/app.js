/**
 * app.js
 * Entry point for the Express backend server
 * Configures middleware
 * Registers all API routes
 * Sets up automated tasks (cron) for inserting workouts and notifying expiring memberships
 * Starts the server and listens on the defined port
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const insertWorkouts = require("./utils/seedWorkouts");
const { notifyExpiringMemberships } = require("./utils/sendEmail");
const logger = require("./utils/logger");
const app = express();
const PORT = process.env.PORT || 3002;

// Enable CORS for all routes to allow cross-origin requests
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
}));

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Route for user-related API endpoints
app.use("/api/users", require("./routes/users"));

// Route for workouts management
app.use("/api/workouts", require("./routes/workout"));

// Route for managing memberships
app.use("/api/memberships", require("./routes/membership"));

// Route for workout exercises CRUD
app.use("/api/workout_exercises", require("./routes/workout_exercises"));

// Route for user workout registrations
app.use("/api/user-workouts", require("./routes/userWorkouts"));

// Route for membership purchases
app.use("/api/purchases", require("./routes/purchasesMembership"));

// Route for user statistics
app.use("/api/workout-stats", require("./routes/workoutStats"));

// Route for admin statistics
app.use("/api/admin-stats", require("./routes/adminStats"));

// Insert initial workouts into the database when server starts
insertWorkouts();

// Schedule a daily job at 2:00 AM to automatically insert workouts
cron.schedule("0 2 * * *", () => {
  logger.info("Running daily workout insertion...");
  insertWorkouts();
});

// Schedule a daily job at 8:00 AM to notify expiring memberships
cron.schedule("0 8 * * *", () => {
  logger.info("Checking expiring memberships...");
  notifyExpiringMemberships();
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "שגיאת שרת פנימית";
  logger.error(`[${statusCode}] ${req.method} ${req.path} – ${message}`, { stack: err.stack });
  res.status(statusCode).json({ error: message });
});

module.exports = app;