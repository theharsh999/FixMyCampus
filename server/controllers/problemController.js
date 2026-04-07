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
    const { title, category, description, location, imageUrl, createdBy, department } = req.body;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    // Generate a unique ticket ID
    const ticketId = generateTicketId();

    // Create new problem in database
    const problem = await Problem.create({
      ticketId,
      title,
      category,
      description,
      location,
      imageUrl,
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

    // Build filter object based on query parameters
    const filter = {};
    if (department) filter.department = department;
    if (createdBy) filter.createdBy = createdBy;

    // Fetch problems, newest first
    const problems = await Problem.find(filter).sort({ createdAt: -1 });

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
    const { status, assignedTo } = req.body;

    // Build update object (only include fields that were sent)
    const updates = {};
    if (status) updates.status = status;
    if (assignedTo) updates.assignedTo = assignedTo;

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
