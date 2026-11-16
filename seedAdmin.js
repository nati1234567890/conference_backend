// Fix for the MongoDB DNS error (EREFUSED)
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db"); // Using your existing DB connection

// Import your actual Admin model
const Admin = require("./models/Admin");

async function createAdmin() {
  try {
    // 1. Connect to DB using your config file
    await connectDB();
    console.log("✅ Connected to MongoDB...");

    const adminEmail = "admin@ethiobridge.com";
    const adminPassword = "SuperSecurePassword123!"; // Change this after logging in

    // 2. Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists! You can log in with it.");
      process.exit(0);
    }

    // 3. Create the admin
    // Note: We do NOT hash the password here. Your Admin model's 
    // `pre("save")` hook will automatically hash it before saving.
    const newAdmin = new Admin({
      name: "System Admin",
      email: adminEmail,
      password: adminPassword, 
      role: "admin",
    });

    await newAdmin.save();
    console.log("🚀 Admin user re-created successfully!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();