import express from "express";
import {
  studentRegister,
  studentLogin,
  adminRegister,
  adminLogin,
} from "../controllers/authController.js";

const router = express.Router();

// ─── Student Auth ───────────────────────────────────────
router.post("/student/register", studentRegister);
router.post("/student/login", studentLogin);

// ─── Admin Auth ─────────────────────────────────────────
router.post("/admin/register", adminRegister);
router.post("/admin/login", adminLogin);

export default router;
