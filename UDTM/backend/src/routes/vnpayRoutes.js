import express from "express";
import {
  createPaymentUrl,
  vnpayReturn,
  vnpayIpn
} from "../controllers/vnpayController.js";

const router = express.Router();

router.post("/create", (req, res, next) => {
  console.log("🔥 HIT API: POST /api/vnpay/create");
  next();
}, createPaymentUrl);

router.get("/return", vnpayReturn);
router.get("/ipn", vnpayIpn);

export default router;
