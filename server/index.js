import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import connectDB from "./config/db.js";
import problemRoutes from "./routes/problemRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB (must be before server starts)
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Middleware ──────────────────────────────────────────
// Parse incoming JSON request bodies
app.use(express.json());

// Allow frontend (localhost:8080) to call this backend
app.use(cors());

// ─── Test Route ─────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "🚀 FixMyCampus Server is running!",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ─────────────────────────────────────────
app.use("/api/problems", problemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);

// Unified error handler for file upload failures and other API errors
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Image must be 5MB or smaller",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
});

// ─── Start Server ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}\n`);
});
