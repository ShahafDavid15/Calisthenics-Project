/**
 * Close MySQL pool once after all test files (avoids closing mid-run and breaking later suites).
 */
module.exports = async function globalTeardown() {
  try {
    const db = require("./db");
    await new Promise((resolve) => {
      db.end(() => resolve());
    });
  } catch {
    // pool may already be ended
  }
};
