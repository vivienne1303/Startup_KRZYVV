const express = require("express");
const registrationController = require("../controllers/registrationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", registrationController.list);
router.post("/", registrationController.create);
router.put("/:id", registrationController.update);
router.delete("/:id", registrationController.remove);

module.exports = router;
