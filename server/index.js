import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import problemRoutes from "./routes/problemRoutes.js";
import authRoutes from "./routes/authRoutes.js";

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

// ─── Start Server ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}\n`);
});
