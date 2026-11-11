const express = require("express");
const router = express.Router();

const rateLimit = require("express-rate-limit");

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 registrations per IP per hour
  message: {
    success: false,
    message: "Too many registration attempts. Try again later.",
  },
});

const { createRegistration } = require("../controllers/registrationController");

router.post("/", registerLimiter, createRegistration);

module.exports = router;
