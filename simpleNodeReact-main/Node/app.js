require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const insertWorkouts = require("./utils/seedWorkouts");
const { notifyExpiringMemberships } = require("./utils/sendEmail");
const app = express();
const PORT = 3002;

// Enable CORS for all routes to allow cross-origin requests
app.use(cors());

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
  console.log("Running daily workout insertion...");
  insertWorkouts();
});

// Schedule a daily job at 8:00 AM to notify expiring memberships
cron.schedule("0 8 * * *", () => {
  console.log("Checking expiring memberships...");
  notifyExpiringMemberships();
});

// Start the Express server and listen on the defined port
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
