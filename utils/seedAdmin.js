require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

(async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@ethiobridge.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@2026";

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log("⚠️  Admin already exists:", email);
    process.exit(0);
  }

  await Admin.create({
    name: "Conference Admin",
    email,
    password,
    role: "admin",
  });

  console.log("✅ Admin created");
  console.log("   Email:", email);
  console.log("   Password:", password);
  await mongoose.connection.close();
  process.exit(0);
})();
