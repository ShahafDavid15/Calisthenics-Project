const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use("/api/users", require("./routes/users"));
app.use("/api/workouts", require("./routes/workouts"));
app.use("/api/memberships", require("./routes/memberships"));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
