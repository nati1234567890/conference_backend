const express = require("express");
const router = express.Router();
const { verifyByQr, checkIn } = require("../controllers/verifyController");
const { protect } = require("../middleware/auth");

// Public (embedded in QR)
router.get("/:registrationId", verifyByQr);

// Public (scanning app / staff phone)
router.post("/checkin", protect, checkIn);

module.exports = router;
