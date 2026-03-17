require("dotenv").config();
const app = require("./app");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});