import express from "express";
import { createProblem, getProblems, updateProblem } from "../controllers/problemController.js";

const router = express.Router();

// POST   /api/problems      → Create a new problem
router.post("/", createProblem);

// GET    /api/problems      → Get all problems (with optional filters)
router.get("/", getProblems);

// PATCH  /api/problems/:id  → Update status or assignedTo
router.patch("/:id", updateProblem);

export default router;
