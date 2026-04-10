import Student from "../models/Student.js";
import Admin from "../models/Admin.js";
import fs from "fs";
import path from "path";

function getLocalImagePath(file) {
  if (!file?.filename) return null;
  return `/uploads/${file.filename}`;
}

function getLocalImageDiskPath(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  if (!imageUrl.startsWith("/uploads/")) return null;
  return path.resolve("uploads", path.basename(imageUrl));
}

const getStudentPayload = (student) => ({
  _id: student._id,
  name: student.name,
  email: student.email,
  class: student.class,
  rollNo: student.rollNo,
  div: student.div,
  year: student.year,
  profileImage: student.profileImage,
  role: "student",
});

const getAdminPayload = (admin) => ({
  _id: admin._id,
  name: admin.name,
  email: admin.email,
  department: admin.department,
  profileImage: admin.profileImage,
  role: "admin",
});

// ─── 1. Student Register ────────────────────────────────
// POST /api/auth/student/register
export const studentRegister = async (req, res) => {
  try {
    const { name, email, password, class: studentClass, rollNo, div, year } = req.body;
    const parsedRollNo = Number(rollNo);

    if (Number.isNaN(parsedRollNo) || parsedRollNo < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid roll number",
      });
    }

    if (parsedRollNo > 80) {
      return res.status(400).json({
        success: false,
        message: "Roll number cannot exceed 80",
      });
    }

    // Check if student already exists
    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const existingStudent = await Student.findOne({
      class: studentClass,
      rollNo: parsedRollNo,
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with this roll number already exists in this class",
      });
    }

    // Create new student
    const student = await Student.create({
      name,
      email,
      password,
      class: studentClass,
      rollNo: parsedRollNo,
      div,
      year,
    });

    res.status(201).json({
      success: true,
      data: getStudentPayload(student),
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.class && error.keyPattern?.rollNo) {
      return res.status(400).json({
        success: false,
        message: "Student with this roll number already exists in this class",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── 2. Student Login ───────────────────────────────────
// POST /api/auth/student/login
export const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password (plain text for now)
    if (student.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      success: true,
      data: getStudentPayload(student),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── 3. Admin Register ──────────────────────────────────
// POST /api/auth/admin/register
export const adminRegister = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    // Check if admin already exists
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password,
      department,
    });

    res.status(201).json({
      success: true,
      data: getAdminPayload(admin),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── 4. Admin Login ─────────────────────────────────────
// POST /api/auth/admin/login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password (plain text for now)
    if (admin.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      success: true,
      data: getAdminPayload(admin),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── 5. Profile Image Upload ───────────────────────────
// PATCH /api/auth/profile-image
export const updateProfileImage = async (req, res) => {
  try {
    const { email, role } = req.body;

    // TODO:
    // Replace email-based identification with JWT authentication
    // After login, token will securely identify user

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: "email and role are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    let user = null;

    if (role === "student") {
      user = await Student.findOne({ email });
    } else if (role === "admin") {
      user = await Admin.findOne({ email });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.profileImage?.url) {
      try {
        const previousImagePath = getLocalImageDiskPath(user.profileImage.url);
        if (previousImagePath && fs.existsSync(previousImagePath)) {
          fs.unlinkSync(previousImagePath);
        }
      } catch (err) {
        console.log("Old image delete failed");
      }
    }

    const profileImageUrl = getLocalImagePath(req.file);

    user.profileImage = {
      url: profileImageUrl,
      filename: req.file.filename,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: role === "admin" ? getAdminPayload(user) : getStudentPayload(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── 6. Get Profile ───────────────────────────────────
// GET /api/auth/profile?email=...&role=...
export const getProfile = async (req, res) => {
  try {
    const { email, role } = req.query;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: "email and role are required",
      });
    }

    let user = null;

    if (role === "student") {
      user = await Student.findOne({ email });
    } else if (role === "admin") {
      user = await Admin.findOne({ email });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: role === "admin" ? getAdminPayload(user) : getStudentPayload(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
