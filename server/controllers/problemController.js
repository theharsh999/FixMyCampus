import Problem from "../models/Problem.js";

// ─── Helper: Generate Ticket ID ─────────────────────────
// Creates a random ID like FMC-1234
function generateTicketId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `FMC-${num}`;
}

// ─── 1. Create a New Problem ────────────────────────────
// POST /api/problems
export const createProblem = async (req, res) => {
  try {
    const { title, category, priority, description, location, createdBy, department } = req.body;

    const issueImage = req.file
      ? {
          url: req.file.path,
          filename: req.file.filename,
        }
      : null;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    if (!createdBy) {
      return res.status(400).json({
        success: false,
        message: "Student reference is required",
      });
    }

    // Prevent duplicate complaints sent within a short time window
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const duplicateProblem = await Problem.findOne({
      title,
      description,
      createdBy,
      createdAt: { $gte: fiveSecondsAgo },
    }).sort({ createdAt: -1 });

    if (duplicateProblem) {
      return res.status(409).json({
        success: false,
        message: "Duplicate submission detected",
      });
    }

    // Generate a unique ticket ID
    const ticketId = generateTicketId();

    // Create new problem in database
    const problem = await Problem.create({
      ticketId,
      title,
      category,
      priority: priority || "Medium",
      description,
      location,
      imageUrl: issueImage?.url || null,
      issueImage,
      createdBy,
      department,
    });

    res.status(201).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── 2. Get All Problems ────────────────────────────────
// GET /api/problems
// Optional filters: ?department=MECH&createdBy=Harsh
export const getProblems = async (req, res) => {
  try {
    const { department, createdBy } = req.query;

    // Build filter object based on simple query parameters
    const filter = {};
    if (department) filter.department = department;
    if (createdBy) filter.createdBy = createdBy;

    // Fetch problems, newest first
    const problems = await Problem.find(filter)
      .populate("createdBy")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: problems.length,
      data: problems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── 3. Update a Problem ────────────────────────────────
// PATCH /api/problems/:id
// Can update: status, assignedTo
export const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, priority } = req.body;

    // Build update object (only include fields that were sent)
    const updates = {};

    // If complaint is assigned, move it to In Progress by default.
    if (assignedTo) {
      updates.assignedTo = assignedTo;
      updates.status = "In Progress";
    }

    // Manual status update should still work (e.g., Resolved).
    if (status) updates.status = status;
    if (priority) updates.priority = priority;

    // Find and update the problem
    const problem = await Problem.findByIdAndUpdate(id, updates, {
      new: true,           // Return the updated document
      runValidators: true, // Run schema validation on update
    });

    // If no problem found with that ID
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
