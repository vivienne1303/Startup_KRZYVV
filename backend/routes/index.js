const express = require("express");
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const careerDnaRoutes = require("./careerDnaRoutes");
const opportunityRoutes = require("./opportunityRoutes");
const profileRoutes = require("./profileRoutes");
const registrationRoutes = require("./registrationRoutes");
const socialRoutes = require("./socialRoutes");
const portfolioRoutes = require("./portfolioRoutes");
const careerCopilotRoutes = require("./careerCopilotRoutes");
const lifePlannerRoutes = require("./lifePlannerRoutes");
const partnerRoutes = require("./partnerRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/profile", profileRoutes);
router.use("/opportunities", opportunityRoutes);
router.use("/registrations", registrationRoutes);
router.use("/career-dna", careerDnaRoutes);
router.use("/social", socialRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/career-copilot", careerCopilotRoutes);
router.use("/life-planner", lifePlannerRoutes);
router.use("/partners", partnerRoutes);

module.exports = router;
