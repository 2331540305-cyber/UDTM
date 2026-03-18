import express from "express";
import { registerUser, loginUser, googleLogin } from "../controllers/authController.js";

const router = express.Router();

// Middleware log cho register route
router.post("/register", (req, res, next) => {
  console.log("\n🔹 === ROUTE: POST /api/auth/register ===");
  console.log("📨 Raw Body:", req.body);
  console.log("📋 Headers:", {
    "content-type": req.headers["content-type"],
    "content-length": req.headers["content-length"],
  });
  next();
}, registerUser);

router.post("/login", loginUser);

// 🔥 Route Google login
router.post("/google-login", googleLogin);

export default router;
