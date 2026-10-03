const jwt = require("jsonwebtoken");

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Not authenticated." });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    req.userRole = payload.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session." });
  }
}

/**
 * Reads the bearer token if one is present and ignores it if it is missing or
 * invalid, so a route can serve the public and still recognise an admin. Use
 * this only where the unauthenticated response is itself safe to hand out.
 */
function authOptional(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = payload.id;
      req.userRole = payload.role;
    } catch { /* fall through as an anonymous visitor */ }
  }
  next();
}

function adminRequired(req, res, next) {
  if (req.userRole !== "admin") return res.status(403).json({ error: "Admin access required." });
  next();
}

module.exports = { authRequired, authOptional, adminRequired };
