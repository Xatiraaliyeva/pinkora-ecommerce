import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ].includes(file.mimetype);

  cb(ok ? null : new Error("Only JPG/PNG/WEBP/AVIF allowed"), ok);
};

const baseUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const upload = baseUpload;

export const productUpload = baseUpload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
  { name: "variantImages", maxCount: 20 },
]);