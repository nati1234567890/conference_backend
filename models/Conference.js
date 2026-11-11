const mongoose = require("mongoose");

const conferenceSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
      default: "Ethio Bridge Investment Conference 2026",
    },
    theme: {
      type: String,
      trim: true,
      default: "Invest • Trade • Partner • Grow",
    },
    date: {
      type: String,
      trim: true,
      default: "December 5–6, 2026",
    },
    venue: {
      type: String,
      trim: true,
      default:
        "Unity Park – Science Museum, Addis Ababa, Ethiopia (subject to official venue confirmation)",
    },
    organizer: {
      type: String,
      trim: true,
      default: "Ethio Bridge Global Services PLC",
    },
    description: { type: String, trim: true, default: "" },
    registrationOpen: { type: Boolean, default: true },
    contactEmail: { type: String, trim: true, default: "" },
    contactPhone: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Conference", conferenceSchema);
