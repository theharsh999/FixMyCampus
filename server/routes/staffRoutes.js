import express from "express";
import { getStaffByDepartment } from "../controllers/staffController.js";

const router = express.Router();

router.get("/:department", getStaffByDepartment);

export default router;
