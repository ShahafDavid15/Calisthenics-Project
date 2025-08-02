// Developer: Shahaf David

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3002;

// Enable CORS to allow requests from different origins
app.use(cors());

// Middleware to parse incoming JSON requests
app.use(express.json());

// Mount the users routes at /api/users
app.use("/api/users", require("./routes/users"));

// Mount the workouts routes at /api/workouts
app.use("/api/workouts", require("./routes/workout"));

// Mount the memberships routes at /api/memberships
app.use("/api/memberships", require("./routes/membership"));

// Mount the workout_exercises routes at /api/workout_exercises
app.use("/api/workout_exercises", require("./routes/workout_exercises"));

// Mount the user workout routes
app.use("/api/user-workouts", require("./routes/userWorkouts"));

// Mount the purchasesMembership route
app.use("/api/purchases", require("./routes/purchasesMembership"));

// Mount the PayPal routes at /api/paypal
app.use("/api/paypal", require("./routes/paypal"));

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
