import mongoose from "mongoose";

// ─── Problem Schema ─────────────────────────────────────
// This is the main collection where all campus complaints are stored.

const problemSchema = new mongoose.Schema(
  {
    // Unique ticket ID like FMC-1234
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },

    // Short title of the complaint
    title: {
      type: String,
      required: true,
    },

    // Category of the issue
    category: {
      type: String,
      required: true,
      enum: ["Electrical", "Cleaning", "Network", "Plumbing", "Furniture", "Other"],
    },

    // Detailed description of the problem
    description: {
      type: String,
      required: true,
    },

    // Where the issue is located on campus
    location: {
      type: String,
      required: true,
    },

    // Optional photo of the issue
    imageUrl: {
      type: String,
      default: null,
    },

    // Uploaded image details
    issueImage: {
      type: {
        url: String,
        filename: String,
      },
      default: null,
    },

    // Current status of the complaint
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },

    // Priority level
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    // Preprocessed complaint keywords used for similarity-based clustering.
    keywords: {
      type: [String],
      default: [],
    },

    // How many duplicate submissions were merged into this complaint.
    duplicateCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Unique students who reported this complaint cluster.
    reportedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],

    // Student who submitted the complaint
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    // Department responsible for handling the complaint
    department: {
      type: String,
      enum: ["COMP", "IT", "AIML", "AIDS", "ENTC", "IoT", "MECH", "MME", "CSE", "ECS", "CIVIL"],
      required: true,
    },

    // Staff member assigned by admin (optional)
    assignedTo: {
      type: String,
      default: null,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// Supports fast recent-cluster lookup queries.
problemSchema.index({ department: 1, category: 1, createdAt: -1 });

// Create and export the model
const Problem = mongoose.model("Problem", problemSchema);

export default Problem;
