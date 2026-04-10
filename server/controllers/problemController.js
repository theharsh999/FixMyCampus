import Problem from "../models/Problem.js";

function getOptimizedCloudinaryUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (url.includes("/upload/f_webp,q_auto,w_auto/")) return url;
  return url.replace("/upload/", "/upload/f_webp,q_auto,w_auto/");
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

    const issueImage = req.file
      ? {
          url: getOptimizedCloudinaryUrl(req.file.path),
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

    // Smart clustering: compare keyword overlap for complaints from the
    // same category and location in the last 15 minutes.
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
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

      await matchedProblem.save();

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
      duplicateCount: 0,
      reportedBy: [createdBy],
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
