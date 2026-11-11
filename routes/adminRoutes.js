const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const ctrl = require("../controllers/adminController");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 min
  message: {
    success: false,
    message: "Too many login attempts. Try again in 15 minutes.",
  },
});
// Public
router.post("/login", loginLimiter, ctrl.login);

// Protected
router.get("/registrations", protect, ctrl.listRegistrations);
router.get("/registrations/:id", protect, ctrl.getRegistration);
router.patch("/registrations/:id", protect, ctrl.updateRegistration);
router.delete("/registrations/:id", protect, ctrl.deleteRegistration);
router.get("/stats", protect, ctrl.getStats);
router.post("/registrations/:id/resend-email", protect, ctrl.resendEmail);
router.get("/export/excel", protect, ctrl.exportExcel);
router.get("/export/pdf", protect, ctrl.exportPdf);
module.exports = router;
