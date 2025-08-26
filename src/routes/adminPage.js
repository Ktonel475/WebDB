// backend/src/routes/dashboard.js
const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const router = express.Router();

router.get("/", requireAuth, requireAdmin, async (req, res) => {
  // Fetch admin-specific data
  const users = await prisma.user.findMany();
  const papers = await prisma.paper.findMany();
  res.json({ users, papers });
});

module.exports = router;
