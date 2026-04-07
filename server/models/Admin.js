import mongoose from "mongoose";

// ─── Admin Schema ───────────────────────────────────────
// Admins who manage and resolve campus complaints

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      enum: ["COMP", "IT", "AIML", "AIDS", "ENTC", "IoT", "MECH", "MME", "CSE", "ECS", "CIVIL"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
