const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      family: 4,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Force Mongoose to sync indexes and surface index errors
    await Promise.all(
      mongoose.modelNames().map((name) => mongoose.models[name].syncIndexes()),
    );
    console.log("✅ Model indexes synced");
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error("Details:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
