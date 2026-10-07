const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  uploadImages,
  searchProperties
} = require("../controllers/propertyController");

const router = express.Router();

router.get("/search", searchProperties);
router.get("/", getProperties);
router.get("/:id", getProperty);

router.post("/", protect, createProperty);
router.put("/:id", protect, updateProperty);
router.delete("/:id", protect, deleteProperty);
router.post("/:id/images", protect, upload.array("images", 10), uploadImages);

module.exports = router;
