const express = require("express");
const router = express.Router();
const { verifyByQr, checkIn } = require("../controllers/verifyController");

// Public (embedded in QR)
router.get("/:registrationId", verifyByQr);

// Public (scanning app / staff phone)
router.post("/checkin", checkIn);

module.exports = router;
