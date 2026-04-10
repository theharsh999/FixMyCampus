import multer from "multer";
import CloudinaryStorage from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = CloudinaryStorage({
  cloudinary,
  params: {
    folder: "fixmycampus",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

function fileFilter(req, file, cb) {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }

  cb(new Error("Only image files are allowed"), false);
}

const upload = multer({
  storage,
  fileFilter,
});

export default upload;