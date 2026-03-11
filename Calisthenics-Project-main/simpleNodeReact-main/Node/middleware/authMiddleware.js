/**
 * Auth middleware - verifies JWT and attaches user to request.
 * Expects: Authorization: Bearer <token>
 */

const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "נדרשת התחברות" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "פג תוקף ההתחברות, התחבר מחדש" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "אין הרשאה לגשת למשאב זה" });
  }
  next();
}

module.exports = { authMiddleware, requireAdmin };
