const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { chat } = require("../controllers/careerCopilotController");
const router = express.Router();
const requests = new Map();
const rateLimit = (req, res, next) => {
  const key = req.user?.id || req.ip;
  const now = Date.now();
  const recent = (requests.get(key) || []).filter((time) => now - time < 60000);
  if (recent.length >= Number(process.env.CAREER_COPILOT_RATE_LIMIT || 10)) return res.status(429).json({ error: { message: "Too many Career Copilot messages. Please wait a minute and try again." } });
  recent.push(now); requests.set(key, recent); next();
};
router.use(authMiddleware);
router.post("/chat", rateLimit, chat);
module.exports = router;
