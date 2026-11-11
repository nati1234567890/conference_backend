require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Conference = require("../models/Conference");

(async () => {
  await connectDB();
  await Conference.deleteMany({});
  const conf = await Conference.create({
    eventName: "Ethio Bridge Investment Conference 2026",
    theme: "Invest • Trade • Partner • Grow",
    date: "December 5–6, 2026",
    venue:
      "Unity Park – Science Museum, Addis Ababa, Ethiopia (subject to official venue confirmation)",
    organizer: "Ethio Bridge Global Services PLC",
  });
  console.log("🌱 Seeded conference:", conf.eventName);
  await mongoose.connection.close();
  process.exit(0);
})();
