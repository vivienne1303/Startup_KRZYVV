const express = require("express");
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const careerDnaRoutes = require("./careerDnaRoutes");
const opportunityRoutes = require("./opportunityRoutes");
const profileRoutes = require("./profileRoutes");
const registrationRoutes = require("./registrationRoutes");

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

module.exports = router;
