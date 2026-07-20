const express = require("express");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const scoutController = require("../controllers/opportunityScoutAdminController");

const router = express.Router();

router.post("/create-admin", adminController.createDevelopmentAdmin);

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/users", adminController.listUsers);
router.get("/profiles", adminController.listUserProfiles);
router.get("/profiles/:id", adminController.getUserProfile);
router.put("/profiles/:id", adminController.updateUserProfile);

router.get("/registrations", adminController.listAllRegistrations);
router.put("/registrations/:id", adminController.updateAnyRegistration);
router.delete("/registrations/:id", adminController.deleteAnyRegistration);

router.get("/career-dna", adminController.listAllCareerDnaResults);
router.get("/opportunities/:id", adminController.getOpportunity);
router.get("/dashboard", adminController.getDashboardStats);
router.get("/partners", scoutController.listPartners);
router.put("/partners/:id", scoutController.reviewPartner);
router.get("/opportunity-reviews", scoutController.reviewQueue);
router.put("/opportunity-reviews/:id", scoutController.reviewOpportunity);

module.exports = router;
