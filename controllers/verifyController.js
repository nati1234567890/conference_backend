const Registration = require("../models/Registration");
const Conference = require("../models/Conference");

// @desc    Look up a registration by ID (public — what the QR opens)
// @route   GET /api/verify/:registrationId
exports.verifyByQr = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const reg = await Registration.findOne({
      registrationId: registrationId.trim().toUpperCase(),
    });

    if (!reg) {
      return res.status(404).json({
        success: false,
        message: "Invalid QR code — registration not found",
      });
    }

    // Cancelled registrations are rejected at the door
    if (reg.status === "cancelled") {
      return res.status(403).json({
        success: false,
        message: "This registration has been cancelled",
      });
    }

    const card = {
      registrationId: reg.registrationId,
      fullName: reg.fullName,
      company: reg.company,
      jobTitle: reg.jobTitle,
      country: reg.country,
      registrationCategory: reg.registrationCategory,
      areaOfInterest: reg.areaOfInterest,
      status: reg.status,
      checkedIn: reg.checkedIn,
      checkedInAt: reg.checkedInAt,
    };

    // If a phone browser opens this, show a nice card
    if (req.accepts(["html", "json"]) === "html") {
      return res.send(renderCard(card));
    }

    res.json({ success: true, data: card });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark a registration as checked in
// @route   POST /api/verify/checkin   { registrationId }
exports.checkIn = async (req, res) => {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      return res
        .status(400)
        .json({ success: false, message: "registrationId is required" });
    }

    // Atomic check-and-update: findOneAndUpdate ensures two concurrent scans
    // can't both succeed
    const id = registrationId.trim().toUpperCase();

    // 1. Look up first so we can return meaningful errors
    const existing = await Registration.findOne({ registrationId: id });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Invalid QR code — registration not found",
      });
    }

    if (existing.status === "cancelled") {
      return res.status(403).json({
        success: false,
        message: "This registration has been cancelled",
      });
    }

    if (existing.checkedIn) {
      return res.status(409).json({
        success: false,
        message: "Already checked in",
        data: {
          registrationId: existing.registrationId,
          fullName: existing.fullName,
          checkedInAt: existing.checkedInAt,
        },
      });
    }

    // 2. Atomically mark as checked in
    const updated = await Registration.findOneAndUpdate(
      { registrationId: id, checkedIn: false },
      {
        checkedIn: true,
        checkedInAt: new Date(),
        status: existing.status === "pending" ? "verified" : existing.status,
      },
      { new: true },
    );

    if (!updated) {
      // Lost the race — another scan beat us
      return res.status(409).json({
        success: false,
        message: "Already checked in",
      });
    }

    res.json({
      success: true,
      message: `Welcome, ${updated.fullName}!`,
      data: {
        registrationId: updated.registrationId,
        fullName: updated.fullName,
        company: updated.company,
        registrationCategory: updated.registrationCategory,
        status: updated.status,
        checkedInAt: updated.checkedInAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const renderCard = (c) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${c.registrationId}</title>
  <style>
    body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; margin:0; background:#f4f6f9; padding:20px; }
    .card { max-width:420px; margin:0 auto; background:#fff; border-radius:14px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,.08); }
    .head { background:#0B1E3D; color:#fff; padding:24px; text-align:center; }
    .head h1 { margin:0; font-size:18px; }
    .head p { margin:6px 0 0; color:#c9a34a; font-size:12px; letter-spacing:1px; }
    .body { padding:24px; }
    .name { font-size:22px; font-weight:700; color:#0B1E3D; margin:0 0 6px; }
    .company { color:#6b7280; margin:0 0 18px; }
    .row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f1f3f5; font-size:14px; }
    .row:last-child { border:none; }
    .label { color:#6b7280; }
    .status { display:inline-block; padding:6px 12px; border-radius:999px; font-size:12px; font-weight:600; margin-top:16px; }
    .status.in { background:#d1fae5; color:#065f46; }
    .status.out { background:#fef3c7; color:#92400e; }
    .status.cx { background:#fee2e2; color:#991b1b; }
    button { width:100%; margin-top:20px; padding:14px; border:none; border-radius:10px; font-size:15px; font-weight:600; cursor:pointer; }
    button.in { background:#0B1E3D; color:#fff; }
    button.disabled { background:#e5e7eb; color:#9ca3af; cursor:not-allowed; }
  </style>
</head>
<body>
  <div class="card">
    <div class="head">
      <h1>Ethio Bridge Investment Conference 2026</h1>
      <p>Invest • Trade • Partner • Grow</p>
    </div>
    <div class="body">
      <p class="name">${c.fullName}</p>
      <p class="company">${c.company} · ${c.jobTitle}</p>
      <div class="row"><span class="label">ID</span><span>${c.registrationId}</span></div>
      <div class="row"><span class="label">Category</span><span>${c.registrationCategory}</span></div>
      <div class="row"><span class="label">Country</span><span>${c.country}</span></div>
      ${
        c.checkedIn
          ? `<span class="status in">✓ Checked in</span>`
          : c.status === "cancelled"
            ? `<span class="status cx">Cancelled</span>`
            : `<span class="status out">Not checked in</span>`
      }
     ${
       c.checkedIn
         ? `<div class="status-pill in" style="margin-top:20px;text-align:center;">✓ Checked in</div>`
         : c.status === "cancelled"
           ? `<div class="status-pill cx" style="margin-top:20px;text-align:center;">Cancelled</div>`
           : `<div class="status-pill out" style="margin-top:20px;text-align:center;">Not yet checked in — please see staff at the counter</div>`
     }
    </div>
  </div>

</body>
</html>
`;
