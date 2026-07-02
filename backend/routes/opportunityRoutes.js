const express = require("express");
const opportunityController = require("../controllers/opportunityController");
const adminMiddleware = require("../middleware/adminMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", opportunityController.list);
router.get("/:id", opportunityController.getById);
router.post("/", authMiddleware, adminMiddleware, opportunityController.create);
router.put("/:id", authMiddleware, adminMiddleware, opportunityController.update);
router.delete("/:id", authMiddleware, adminMiddleware, opportunityController.remove);

module.exports = router;
