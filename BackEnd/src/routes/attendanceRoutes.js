const express = require("express");
const { punch, getMine, getAll, getForEmployee } = require("../controllers/attendanceController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/punch", requireAuth, punch);
router.get("/me", requireAuth, getMine);
router.get("/all", requireAuth, requireAdmin, getAll);
router.get("/employee/:id", requireAuth, requireAdmin, getForEmployee);

module.exports = router;
