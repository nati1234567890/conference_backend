const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    // --- Form fields ---
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company / Organization is required"],
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, "Job title / position is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    businessSector: {
      type: String,
      required: [true, "Business sector is required"],
      trim: true,
    },
    registrationCategory: {
      type: String,
      required: [true, "Registration category is required"],
      enum: {
        values: [
          "Investor",
          "Business Delegation",
          "Government Official",
          "Sponsor",
          "Exhibitor",
          "Media",
          "Guest",
          "Other",
        ],
        message: "{VALUE} is not a valid registration category",
      },
    },
    areaOfInterest: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr && arr.length > 0,
        message: "Select at least one area of interest",
      },
      enum: {
        values: [
          "Investment Opportunities",
          "Business Partnership",
          "Sponsorship",
          "Exhibition",
          "Other",
        ],
        message: "{VALUE} is not a valid area of interest",
      },
    },

    // --- System-generated fields ---
    registrationId: {
      type: String,
      unique: true,
      index: true,
    },
    qrCode: { type: String, default: "" },
    qrPayload: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "verified", "cancelled"],
      default: "pending",
    },
    emailSent: { type: Boolean, default: false },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

// Prevent duplicate registrations with the same email
registrationSchema.index({ email: 1 }, { unique: true });

// Compound indexes for filtering
registrationSchema.index({ registrationCategory: 1, status: 1 });
registrationSchema.index({ fullName: "text", company: "text", email: "text" });

module.exports = mongoose.model("Registration", registrationSchema);
