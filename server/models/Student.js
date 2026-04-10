import mongoose from "mongoose";
import bcrypt from "bcrypt";

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

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (this.password.startsWith("$2")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

studentSchema.methods.comparePassword = async function (enteredPassword) {
  if (this.password.startsWith("$2")) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  return enteredPassword === this.password;
};

const Student = mongoose.model("Student", studentSchema);

export default Student;
