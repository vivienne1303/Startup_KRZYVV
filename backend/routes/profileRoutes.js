const express = require("express");
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", profileController.getProfile);
router.put("/", profileController.updateProfile);
router.get("/applications", profileController.getApplications);
router.get("/counts", profileController.getCounts);
router.get("/saved", profileController.getSaved);
router.post("/saved", profileController.addSaved);
router.delete("/saved/:opportunityId", profileController.deleteSaved);

module.exports = router;
