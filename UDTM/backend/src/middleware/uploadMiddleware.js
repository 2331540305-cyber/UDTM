import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../../uploads");

// Cấu hình Cloudinary - nếu có credentials
const CLOUDINARY_CONFIGURED = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (CLOUDINARY_CONFIGURED) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("✅ Cloudinary configured");
} else {
  console.warn("⚠️ Cloudinary not configured - will use local upload");
}

// Tạo folder uploads nếu chưa có
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage - lưu tạm file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Filter file - cho phép cả hình ảnh và video
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|avi|mov|mkv|flv|wmv|webm|m4v/;
  const extname = path.extname(file.originalname).toLowerCase().slice(1);
  
  const isImage = allowedImageTypes.test(extname) || allowedImageTypes.test(file.mimetype);
  const isVideo = allowedVideoTypes.test(extname) || file.mimetype.startsWith("video/");

  if (isImage || isVideo) {
    return cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WEBP) hoặc video (MP4, AVI, MOV, MKV...)"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max cho video
});

// Controller upload - đẩy lên Cloudinary
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có file được upload" });
    }

    console.log(`Upload request: filename=${req.file.filename}, mimetype=${req.file.mimetype}, size=${req.file.size}`);

    // If Cloudinary is not configured, return local server file path
    if (!CLOUDINARY_CONFIGURED) {
      const localUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      console.log("Returning local upload URL:", localUrl);
      return res.json({ success: true, url: localUrl, message: "Upload (local) thành công" });
    }

    console.log("Uploading file to Cloudinary:", req.file.filename);

    // Determine if this is a video type and choose upload method accordingly
    const isVideo = req.file.mimetype.startsWith("video/") || /mp4|avi|mov|mkv|flv|wmv|webm|m4v/.test(path.extname(req.file.originalname).toLowerCase());

    let result;
    if (isVideo && req.file.size > 10 * 1024 * 1024) {
      // For bigger video files, use upload_large which supports chunked uploads
      console.log("Detected large video file - using upload_large for better reliability");
      result = await cloudinary.uploader.upload_large(req.file.path, {
        folder: "UDTM/products",
        resource_type: "video",
        use_filename: true,
        unique_filename: true,
      });
    } else {
      // Use standard upload for images or small videos
      result = await cloudinary.uploader.upload(req.file.path, {
        folder: "UDTM/products",
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
      });
    }

    console.log("Cloudinary upload success:", result.secure_url);

    // Xóa file tạm sau khi upload xong
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    res.json({
      success: true,
      url: result.secure_url,
      cloudinaryId: result.public_id,
      message: "Upload thành công",
    });
    } catch (error) {
    console.error("Upload error:", error);
    
    // If Cloudinary configured and upload failed, fallback to returning local file URL
    if (req.file) {
      // If cloudinary was configured but the upload failed, we can still return the locally-served file
      if (CLOUDINARY_CONFIGURED) {
        const fallbackUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        console.warn("Cloudinary upload failed, falling back to local URL:", fallbackUrl);
        return res.json({ success: true, url: fallbackUrl, message: "Cloudinary upload failed — returned local file as fallback" });
      }

      // If we are not using Cloudinary, or after returning fallback, delete the file if needed
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    }

    // Provide more detailed error message for client while avoiding sensitive data
    const errMessage = error?.message || "Lỗi upload không xác định";
    const errCode = error?.http_code || 500;
    // Include optional Cloudinary error info in server log only
    if (error?.error) console.error("Cloudinary error details:", error.error);
    res.status(errCode).json({ message: errMessage });
  }
};

export default upload;
