const express = require("express");
const registrationController = require("../controllers/registrationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", registrationController.list);
router.get("/me", registrationController.list);
router.get("/check/:opportunityId", registrationController.check);
router.post("/", registrationController.create);
router.post("/external-confirm", registrationController.confirmExternal);
router.post("/:id/portfolio-reminder", registrationController.portfolioReminder);
router.get("/:id", registrationController.getById);
router.put("/:id", registrationController.update);
router.delete("/:id", registrationController.remove);

module.exports = router;
