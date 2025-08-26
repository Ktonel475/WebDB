const jwt = require("jsonwebtoken");

// Middleware to check login
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // contains id, email, role, etc.
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Middleware to check admin role
function requireAdmin(req, res, next) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
