require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const app = express();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
// const mongoSanitize = require("express-mongo-sanitize");

// ... app = express() ...

app.use(helmet());

// Global rate limit — 200 requests per 15 minutes per IP
if (process.env.RATE_LIMIT_ENABLED !== "false") {
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests, try again later",
      },
    }),
  );
}

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
// app.use(mongoSanitize());
app.use(morgan("dev"));
// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Conference Registration API is running 🚀" });
});

// Routes will be added in later steps
// Models
// Routes
app.use("/api/conference", require("./routes/conferenceRoutes"));
app.use("/api/registrations", require("./routes/registrationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/verify", require("./routes/verifyRoutes"));
// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
