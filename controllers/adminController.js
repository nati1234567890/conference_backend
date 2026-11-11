const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Registration = require("../models/Registration");
const Conference = require("../models/Conference");
const sendConfirmationEmail = require("../utils/sendConfirmationEmail");
const exportRegistrationsToExcel = require("../utils/exportExcel");
const exportRegistrationsToPdf = require("../utils/exportPdf");
const signToken = (admin) =>
  jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

// @desc    Admin login
// @route   POST /api/admin/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!admin || !(await admin.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    res.json({
      success: true,
      token: signToken(admin),
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    List registrations with pagination, search, filters
// @route   GET /api/admin/registrations
exports.listRegistrations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      category,
      status,
      checkedIn,
      emailSent,
      sort = "-createdAt",
    } = req.query;

    const filter = {};

    if (search.trim()) {
      const rx = new RegExp(search.trim(), "i");
      filter.$or = [
        { fullName: rx },
        { email: rx },
        { company: rx },
        { phone: rx },
        { country: rx },
        { registrationId: rx },
      ];
    }

    if (category) filter.registrationCategory = category;
    if (status) filter.status = status;
    if (checkedIn !== undefined) filter.checkedIn = checkedIn === "true";
    if (emailSent !== undefined) filter.emailSent = emailSent === "true";

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Registration.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .select("-qrCode -qrPayload"), // strip big fields for list view
      Registration.countDocuments(filter),
    ]);

    res.json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get one registration
// @route   GET /api/admin/registrations/:id
exports.getRegistration = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) {
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });
    }
    res.json({ success: true, data: reg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update registration (status, notes, checkedIn)
// @route   PATCH /api/admin/registrations/:id
exports.updateRegistration = async (req, res) => {
  try {
    const allowed = ["status", "checkedIn", "notes"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.checkedIn === true) {
      updates.checkedInAt = new Date();
    } else if (updates.checkedIn === false) {
      updates.checkedInAt = null;
    }

    const reg = await Registration.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!reg) {
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });
    }
    res.json({ success: true, data: reg });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete registration
// @route   DELETE /api/admin/registrations/:id
exports.deleteRegistration = async (req, res) => {
  try {
    const reg = await Registration.findByIdAndDelete(req.params.id);
    if (!reg) {
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });
    }
    res.json({ success: true, message: "Registration deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Stats (total, by category, by status, checked-in count)
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [total, byCategory, byStatus, checkedIn, pendingEmail] =
      await Promise.all([
        Registration.countDocuments(),
        Registration.aggregate([
          { $group: { _id: "$registrationCategory", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Registration.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Registration.countDocuments({ checkedIn: true }),
        Registration.countDocuments({ emailSent: false }),
      ]);

    res.json({
      success: true,
      data: {
        totalRegistrations: total,
        checkedIn,
        notCheckedIn: total - checkedIn,
        pendingEmail,
        byCategory,
        byStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Resend confirmation email
// @route   POST /api/admin/registrations/:id/resend-email
exports.resendEmail = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) {
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });
    }

    const conference = await Conference.findOne();
    const result = await sendConfirmationEmail(reg, conference || {});

    if (result.ok) {
      reg.emailSent = true;
      await reg.save();
      return res.json({
        success: true,
        message: "Confirmation email resent",
      });
    }

    res.status(500).json({
      success: false,
      message: `Email failed: ${result.error}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reusable: build the same filter as listRegistrations
const buildFilter = (query) => {
  const { search = "", category, status, checkedIn, emailSent } = query;
  const filter = {};

  if (search.trim()) {
    const rx = new RegExp(search.trim(), "i");
    filter.$or = [
      { fullName: rx },
      { email: rx },
      { company: rx },
      { phone: rx },
      { country: rx },
      { registrationId: rx },
    ];
  }
  if (category) filter.registrationCategory = category;
  if (status) filter.status = status;
  if (checkedIn !== undefined) filter.checkedIn = checkedIn === "true";
  if (emailSent !== undefined) filter.emailSent = emailSent === "true";
  return filter;
};

// @desc    Export registrations as Excel
// @route   GET /api/admin/export/excel
exports.exportExcel = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const registrations = await Registration.find(filter).sort("-createdAt");
    const buffer = await exportRegistrationsToExcel(registrations);

    const filename = `registrations-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Export registrations as PDF
// @route   GET /api/admin/export/pdf
exports.exportPdf = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const registrations = await Registration.find(filter).sort("-createdAt");
    const buffer = await exportRegistrationsToPdf(registrations);

    const filename = `registrations-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
