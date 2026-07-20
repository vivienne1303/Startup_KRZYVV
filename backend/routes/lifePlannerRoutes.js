const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const controller = require("../controllers/lifePlannerController");

const router = express.Router();
router.use(authMiddleware);
router.get("/me", controller.list);
router.put("/preferences", controller.updatePreferences);
router.post("/tasks", controller.createTask);
router.put("/tasks/:id", controller.updateTask);
router.delete("/tasks/:id", controller.removeTask);
router.post("/generate", controller.generate);

module.exports = router;
