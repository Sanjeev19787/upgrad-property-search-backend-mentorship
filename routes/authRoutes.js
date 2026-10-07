const express = require("express");
const { body } = require("express-validator");
const { signup, login, logout } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const authValidation = [
  body("email").isEmail().withMessage("A valid email is required."),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters.")
];

router.post(
  "/signup",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters."),
    ...authValidation
  ],
  signup
);

router.post("/login", authValidation, login);
router.post("/logout", protect, logout);

module.exports = router;
