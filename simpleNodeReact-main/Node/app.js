const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

app.use("/api/users", require("./routes/users"));
app.use("/api/workouts", require("./routes/workout"));
app.use("/api/memberships", require("./routes/membership"));
app.use("/api/workout_exercises", require("./routes/workout_exercises"));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
