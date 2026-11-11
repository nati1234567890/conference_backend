const express = require("express");
const router = express.Router();
const {
  getConference,
  updateConference,
} = require("../controllers/conferenceController");
const { protect } = require("../middleware/auth");

router.get("/", getConference);
router.put("/", protect, updateConference);

module.exports = router;
