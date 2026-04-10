import mongoose from "mongoose";
import bcrypt from "bcrypt";

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

    profileImage: {
      url: String,
      filename: String,
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (this.password.startsWith("$2")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

adminSchema.methods.comparePassword = async function (enteredPassword) {
  if (this.password.startsWith("$2")) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  return enteredPassword === this.password;
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
