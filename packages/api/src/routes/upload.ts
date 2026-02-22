import { Router, Request } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { authMiddleware } from "../middleware/auth.js";

function ensureCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  return { cloudName, apiKey, apiSecret };
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Use JPEG, PNG, WebP or GIF."));
    }
  },
});

export const uploadRouter = Router();
uploadRouter.use(authMiddleware);

uploadRouter.post("/image", upload.single("file"), async (req: Request, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const folder = (typeof req.query.folder === "string" ? req.query.folder : "uploads") || "uploads";

  if (!ensureCloudinaryConfig()) {
    return res.status(500).json({
      error: "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env",
    });
  }

  try {
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      quality: "auto",
      fetch_format: "auto",
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    const msg = err instanceof Error ? err.message : "Upload failed";
    return res.status(500).json({ error: `Upload failed: ${msg}` });
  }
});
