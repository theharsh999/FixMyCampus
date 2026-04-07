import mongoose from "mongoose";

// ─── Student Schema ─────────────────────────────────────
// Students who submit complaints on campus

const studentSchema = new mongoose.Schema(
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

    class: {
      type: String,
      enum: ["COMP", "IT", "AIML", "AIDS", "ENTC", "IoT", "MECH", "MME", "CSE", "ECS", "CIVIL"],
      required: true,
    },

    div: {
      type: String,
      required: true,
    },

    year: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
