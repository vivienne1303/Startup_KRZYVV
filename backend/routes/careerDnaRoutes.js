const express = require("express");
const careerDnaController = require("../controllers/careerDnaController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", careerDnaController.list);
router.post("/", careerDnaController.create);
router.get("/latest", careerDnaController.getLatest);
router.get("/:id", careerDnaController.getById);
router.put("/:id", careerDnaController.update);

module.exports = router;
