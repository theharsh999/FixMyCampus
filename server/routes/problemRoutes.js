import express from "express";
import { createProblem, getProblems, updateProblem } from "../controllers/problemController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// POST   /api/problems      → Create a new problem
router.post(
  "/",
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Image upload failed",
        });
      }

      return next();
    });
  },
  createProblem
);

// GET    /api/problems      → Get all problems (with optional filters)
router.get("/", getProblems);

// PATCH  /api/problems/:id  → Update status or assignedTo
router.patch("/:id", updateProblem);

export default router;
