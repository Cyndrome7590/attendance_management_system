const express = require("express");
const { getAllEmployees } = require("../controllers/employeeController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, requireAdmin, getAllEmployees);

module.exports = router;
