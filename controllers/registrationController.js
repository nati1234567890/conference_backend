const Registration = require("../models/Registration");
const Conference = require("../models/Conference");
const generateRegistrationId = require("../utils/generateRegistrationId");
const generateQRCode = require("../utils/generateQRCode");
const sendConfirmationEmail = require("../utils/sendConfirmationEmail");

exports.createRegistration = async (req, res) => {
  try {
    const conference = await Conference.findOne();
    if (conference && conference.registrationOpen === false) {
      return res.status(403).json({
        success: false,
        message: "Registration is currently closed",
      });
    }

    const existing = await Registration.findOne({
      email: req.body.email?.toLowerCase(),
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This email address is already registered",
      });
    }

    const registrationId = await generateRegistrationId();
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const { qrCode, qrPayload } = await generateQRCode(registrationId, baseUrl);

    const registration = await Registration.create({
      ...req.body,
      registrationId,
      qrCode,
      qrPayload,
    });

    // Send confirmation email — failure does NOT roll back registration
    const mailResult = await sendConfirmationEmail(
      registration,
      conference || {},
    );
    if (mailResult.ok) {
      registration.emailSent = true;
      await registration.save();
    }

    res.status(201).json({
      success: true,
      message: mailResult.ok
        ? "Registration successful. Confirmation email sent."
        : "Registration successful. Confirmation email could not be sent (we will retry).",
      data: {
        registrationId: registration.registrationId,
        fullName: registration.fullName,
        email: registration.email,
        registrationCategory: registration.registrationCategory,
        areaOfInterest: registration.areaOfInterest,
        status: registration.status,
        emailSent: registration.emailSent,
        qrCode: registration.qrCode,
      },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email address is already registered",
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};
