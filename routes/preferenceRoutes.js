const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  upsertPreferences,
  getPreferences,
  deletePreferences
} = require("../controllers/preferenceController");

const router = express.Router();

router.get("/", protect, getPreferences);
router.put("/", protect, upsertPreferences);
router.delete("/", protect, deletePreferences);

module.exports = router;
