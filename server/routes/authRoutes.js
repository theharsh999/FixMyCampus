import express from "express";
import {
  studentRegister,
  studentLogin,
  adminRegister,
  adminLogin,
  getProfile,
  updateProfileImage,
} from "../controllers/authController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ─── Student Auth ───────────────────────────────────────
router.post("/student/register", studentRegister);
router.post("/student/login", studentLogin);

// ─── Admin Auth ─────────────────────────────────────────
router.post("/admin/register", adminRegister);
router.post("/admin/login", adminLogin);

// ─── Profile Image ─────────────────────────────────────
router.patch("/profile-image", upload.single("image"), updateProfileImage);
router.get("/profile", getProfile);

export default router;
