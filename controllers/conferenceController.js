const Conference = require("../models/Conference");

// Helper: get the single conference document (create default if none exists)
const getOrCreateConference = async () => {
  let conf = await Conference.findOne();
  if (!conf) conf = await Conference.create({});
  return conf;
};

// @desc    Get conference info (public)
// @route   GET /api/conference
exports.getConference = async (req, res) => {
  try {
    const conference = await getOrCreateConference();
    res.json({ success: true, data: conference });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update conference info (admin only)
// @route   PUT /api/conference
exports.updateConference = async (req, res) => {
  try {
    const allowed = [
      "eventName",
      "theme",
      "date",
      "venue",
      "organizer",
      "description",
      "registrationOpen",
      "contactEmail",
      "contactPhone",
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const conference = await Conference.findOneAndUpdate({}, updates, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    });

    res.json({ success: true, data: conference });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
