const express = require("express");
const careerDnaController = require("../controllers/careerDnaController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", careerDnaController.list);
router.post("/", careerDnaController.create);

module.exports = router;
