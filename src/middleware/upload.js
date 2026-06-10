import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(__dirname, "../../public/uploads/resumes");
const photoUploadDir = path.resolve(__dirname, "../../public/uploads/photos");

// Ensure directories exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(photoUploadDir)) {
  fs.mkdirSync(photoUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF and Word documents are allowed."), false);
  }
};

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photoUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  },
});

const photoFileFilter = (req, file, cb) => {
  const allowedTypes = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, and WebP images are allowed."), false);
  }
};

export const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: photoFileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB limit
});
