import Problem from "../models/Problem.js";
import Student from "../models/Student.js";
import { sendEmail } from "../utils/mailer.js";

async function sendEmailSafely(sendFn) {
  try {
    await sendFn();
  } catch (error) {
    console.warn("Notification email failed:", error.message);
  }
}

async function resolveNotificationEmail(problem) {
  let email = problem?.userEmail;

  if (!email && problem?.createdBy) {
    // createdBy may already be populated in update flow.
    if (typeof problem.createdBy === "object" && problem.createdBy.email) {
      email = problem.createdBy.email;
    } else {
      const creator = await Student.findById(problem.createdBy).select("email");
      email = creator?.email || null;
    }
  }

  if (!email) {
    console.log("No email found!");
    return null;
  }

  // Backfill legacy complaints that were created before userEmail was added.
  if (!problem.userEmail) {
    problem.userEmail = email;
    await problem.save();
  }

  console.log("Resolved email:", email);
  return email;
}

function buildComplaintMailBody(problem, message) {
  const imageLine = problem.imageUrl ? `\nImage: ${problem.imageUrl}` : "";
  return `${message}\n\nTicket ID: ${problem.ticketId}\nTitle: ${problem.title}\nStatus: ${problem.status}${imageLine}`;
}

function complaintEmailProps(problem, message) {
  return {
    message,
    ticketId: problem.ticketId,
    title: problem.title,
    status: problem.status,
    category: problem.category,
    location: problem.location,
    description: problem.description,
    imageUrl: problem.imageUrl,
  };
}

function getUploadedImagePath(file) {
  if (!file?.path) return null;
  return file.path;
}

// ─── Helper: Generate Ticket ID ─────────────────────────
// Creates a random ID like FMC-1234
function generateTicketId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `FMC-${num}`;
}

// Normalize text for lightweight similarity checks.
function normalizeText(value = "") {
  return value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have", "i",
  "in", "is", "it", "its", "my", "of", "on", "or", "that", "the", "their", "there", "this",
  "to", "was", "were", "will", "with", "room", "block", "issue", "problem", "campus", "not",
]);

function stemToken(token) {
  if (token.length <= 4) return token;

  if (token.endsWith("ing")) return token.slice(0, -3);
  if (token.endsWith("ed")) return token.slice(0, -2);
  if (token.endsWith("es")) return token.slice(0, -2);
  if (token.endsWith("s")) return token.slice(0, -1);

  return token;
}

function extractKeywords(text) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const unique = new Set();

  for (const token of normalized.split(" ")) {
    if (!token || STOPWORDS.has(token) || token.length <= 2) continue;
    if (/^\d+$/.test(token)) continue;

    const stemmed = stemToken(token);
    if (!stemmed || STOPWORDS.has(stemmed) || stemmed.length <= 2) continue;

    unique.add(stemmed);
  }

  return [...unique];
}

function keywordSimilarity(aKeywords, bKeywords) {
  const aSet = new Set(aKeywords || []);
  const bSet = new Set(bKeywords || []);

  if (!aSet.size || !bSet.size) {
    return { score: 0, overlapCount: 0 };
  }

  let intersection = 0;
  for (const token of aSet) {
    if (bSet.has(token)) intersection += 1;
  }

  const union = new Set([...aSet, ...bSet]).size;
  const minSize = Math.max(1, Math.min(aSet.size, bSet.size));
  const jaccard = union ? intersection / union : 0;
  const overlap = intersection / minSize;

  return {
    score: Math.max(jaccard, overlap),
    overlapCount: intersection,
  };
}

const PRIORITY_ORDER = { Low: 1, Medium: 2, High: 3 };
const CLUSTER_SIMILARITY_THRESHOLD = 0.5;

function priorityFromReporterCount(count) {
  if (count >= 6) return "High";
  if (count >= 3) return "Medium";
  return "Low";
}

function maxPriority(current, computed) {
  return PRIORITY_ORDER[current] >= PRIORITY_ORDER[computed] ? current : computed;
}

// ─── 1. Create a New Problem ────────────────────────────
// POST /api/problems
export const createProblem = async (req, res) => {
  try {
    const { title, category, priority, description, location, createdBy, department } = req.body;

    const issueImageUrl = getUploadedImagePath(req.file);
    const issueImage = issueImageUrl
      ? {
          url: issueImageUrl,
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

    const student = await Student.findById(createdBy).select("email");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Smart clustering: compare keyword overlap for complaints from the
    // same category and location in the last 15 minutes.
    const fifteenMinutesAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const combinedInput = `${title} ${description}`;
    const incomingKeywords = extractKeywords(combinedInput);

    const recentCandidates = await Problem.find({
      category,
      department,
      createdAt: { $gte: fifteenMinutesAgo },
    }).sort({ createdAt: -1 });

    const normalizedLocation = normalizeText(location);

    const matchedProblem = recentCandidates.find((candidate) => {
      const isSameLocation = normalizeText(candidate.location) === normalizedLocation;
      if (!isSameLocation) return false;

      const candidateKeywords =
        candidate.keywords && candidate.keywords.length
          ? candidate.keywords
          : extractKeywords(`${candidate.title} ${candidate.description}`);

      const { score, overlapCount } = keywordSimilarity(incomingKeywords, candidateKeywords);
      return score >= CLUSTER_SIMILARITY_THRESHOLD && overlapCount >= 1;
    });

    if (matchedProblem) {
      matchedProblem.duplicateCount = (matchedProblem.duplicateCount || 0) + 1;
      matchedProblem.keywords = Array.from(
        new Set([...(matchedProblem.keywords || []), ...incomingKeywords])
      );

      // Keep unique reporter IDs for impact-aware prioritization.
      const hasReporter = (matchedProblem.reportedBy || []).some(
        (studentId) => studentId.toString() === String(createdBy)
      );

      if (!hasReporter) {
        matchedProblem.reportedBy = [...(matchedProblem.reportedBy || []), createdBy];
      }

      const reporterCount = Math.max(
        (matchedProblem.reportedBy || []).length,
        (matchedProblem.duplicateCount || 0) + 1
      );
      const computedPriority = priorityFromReporterCount(reporterCount);
      matchedProblem.priority = maxPriority(matchedProblem.priority || "Low", computedPriority);

      if (!matchedProblem.userEmail) {
        const matchedCreator = await Student.findById(matchedProblem.createdBy).select("email");
        matchedProblem.userEmail = matchedCreator?.email || student.email;
      }

      await matchedProblem.save();

      await sendEmailSafely(() =>
        sendEmail(
          student.email,
          "Complaint Submitted",
          buildComplaintMailBody(matchedProblem, "Your complaint has been received"),
          complaintEmailProps(matchedProblem, "Your complaint has been received")
        )
      );

      return res.status(200).json({
        success: true,
        clustered: true,
        message: "Complaint matched an existing issue and was added as a duplicate report",
        data: matchedProblem,
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
      keywords: incomingKeywords,
      duplicateCount: 1,
      reportedBy: [createdBy],
      description,
      location,
      imageUrl: issueImageUrl,
      issueImage,
      createdBy,
      userEmail: student.email,
      department,
    });

    await sendEmailSafely(() =>
      sendEmail(
        student.email,
        "Complaint Submitted",
        buildComplaintMailBody(problem, "Your complaint has been received"),
        complaintEmailProps(problem, "Your complaint has been received")
      )
    );

    return res.status(201).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    return res.status(500).json({
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

    const existingProblem = await Problem.findById(id).populate("createdBy", "email");

    if (!existingProblem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const previousStatus = existingProblem.status;

    // Apply updates manually to avoid findByIdAndUpdate stale-data issues.
    if (assignedTo) {
      existingProblem.assignedTo = assignedTo;
      existingProblem.status = "In Progress";
    }

    // Manual status update takes precedence (e.g., Resolved).
    if (status) existingProblem.status = status;
    if (priority) existingProblem.priority = priority;

    await existingProblem.save();

    const problem = existingProblem;
    const hasStatusChanged = problem.status !== previousStatus;
    const notificationEmail = await resolveNotificationEmail(problem);

    console.log("📩 Notification Email:", notificationEmail);
    console.log("Previous Status:", previousStatus);
    console.log("New Status:", problem.status);
    console.log("Has Status Changed:", hasStatusChanged);

    if (notificationEmail) {
      if (assignedTo && !existingProblem.assignedTo) {
        await sendEmailSafely(() =>
          sendEmail(
            notificationEmail,
            "Complaint Assigned",
            buildComplaintMailBody(problem, "Your complaint has been assigned"),
            complaintEmailProps(problem, "Your complaint has been assigned")
          )
        );
      }

      if (hasStatusChanged && problem.status === "In Progress") {
        await sendEmailSafely(() =>
          sendEmail(
            notificationEmail,
            "Complaint In Progress",
            buildComplaintMailBody(problem, "Work has started on your complaint"),
            complaintEmailProps(problem, "Work has started on your complaint")
          )
        );
      }

      if (hasStatusChanged && problem.status === "Resolved") {
        await sendEmailSafely(() =>
          sendEmail(
            notificationEmail,
            "Complaint Resolved",
            buildComplaintMailBody(problem, "Your complaint has been resolved"),
            complaintEmailProps(problem, "Your complaint has been resolved")
          )
        );
      }
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
