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

    rollNo: {
      type: Number,
      required: true,
      min: 1,
      max: 80,
    },

    div: {
      type: String,
      required: true,
    },

    year: {
      type: String,
      required: true,
    },

    profileImage: {
      url: String,
      filename: String,
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.index({ class: 1, rollNo: 1 }, { unique: true });

const Student = mongoose.model("Student", studentSchema);

export default Student;
