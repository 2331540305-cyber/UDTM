import 'dotenv/config';
import qs from "qs";
import crypto from "crypto";
import moment from "moment";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";

const vnp_TmnCode = process.env.VNPAY_TMN_CODE;
const vnp_HashSecret = process.env.VNPAY_HASH_SECRET;
const vnp_Url = process.env.VNPAY_URL;
const returnUrl = process.env.VNPAY_RETURN_URL;

// SORT
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((k) => (sorted[k] = obj[k]));
  return sorted;
}

// --------------------------
// 1️⃣ CREATE PAYMENT URL
// --------------------------
export const createPaymentUrl = async (req, res) => {
  try {
    console.log("\n================= CREATE PAYMENT URL =================");
    console.log("🔥 BODY:", req.body);

    console.log("📌 ENV CHECK:");
    console.log(" - TMN_CODE:", vnp_TmnCode);
    console.log(" - HASH_SECRET:", vnp_HashSecret);
    console.log(" - VNP_URL:", vnp_Url);
    console.log(" - RETURN_URL:", returnUrl);

    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      console.log("❌ MISSING orderId OR amount");
      return res.status(400).json({ message: "Missing orderId or amount" });
    }

    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;

    console.log("🌐 CLIENT IP:", ipAddr);

    const now = moment().format("YYYYMMDDHHmmss");

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode,
      vnp_Amount: amount * 100,
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: "Thanh toan don hang " + orderId,
      vnp_OrderType: "other",
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_Locale: "vn",
      vnp_CreateDate: now,
    };

    console.log("📌 RAW PARAMS:", vnp_Params);

    vnp_Params = sortObject(vnp_Params);

    console.log("📌 SORTED PARAMS:", vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    console.log("🔐 SIGN DATA (raw before HMAC):", signData);

    console.log("🔑 SECRET KEY USED:", vnp_HashSecret);

    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    console.log("🔏 SIGN GENERATED:", signed);

    vnp_Params["vnp_SecureHash"] = signed;

    const paymentUrl = vnp_Url + "?" + qs.stringify(vnp_Params, { encode: true });

    console.log("➡️ FINAL PAYMENT URL:", paymentUrl);
    console.log("=======================================================\n");

    res.json({ payment_url: paymentUrl });
  } catch (err) {
    console.error("❌ ERROR createPaymentUrl:", err);
    res.status(500).json({ message: "Error generating payment URL", error: err.message });
  }
};

// -------------------------------------------------------
// 2️⃣ VNPAY RETURN
// -------------------------------------------------------
export const vnpayReturn = async (req, res) => {
  console.log("\n================= VNPAY RETURN =================");
  console.log("🔍 QUERY:", req.query);

  try {
    const vnp_Params = { ...req.query };
    const clientHash = vnp_Params["vnp_SecureHash"];

    console.log("🔐 CLIENT HASH:", clientHash);

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    const sorted = sortObject(vnp_Params);
    const signData = qs.stringify(sorted, { encode: false });

    console.log("🔐 SERVER SIGN DATA:", signData);

    const serverHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    console.log("🔏 SERVER HASH:", serverHash);

    if (serverHash !== clientHash) {
      console.log("❌ HASH MISMATCH — POSSIBLE ATTACK");
      return res.json({ code: "97", message: "Checksum failed" });
    }

    const orderId = vnp_Params["vnp_TxnRef"];
    const rspCode = vnp_Params["vnp_ResponseCode"];

    console.log("📦 ORDER_ID:", orderId);
    console.log("📌 RESPONSE CODE:", rspCode);

    if (rspCode === "00") {
      console.log("✔ PAYMENT SUCCESS — UPDATING DB...");

      await Order.findOneAndUpdate(
        { order_id: orderId },
        { payment_status: "paid", order_status: "confirmed" }
      );

      await Payment.findOneAndUpdate(
        { order_id: orderId },
        {
          status: "success",
          response_code: rspCode,
          transaction_no: vnp_Params["vnp_TransactionNo"],
        }
      );

      return res.json({ code: "00", message: "Payment success" });
    }

    console.log("❌ PAYMENT FAILED");

    return res.json({ code: rspCode, message: "Payment failed" });
  } catch (err) {
    console.error("❌ ERROR vnpayReturn:", err);
    res.json({ code: "99", message: "Unknown error" });
  }
};

// -------------------------------------------------------
// 3️⃣ IPN (Server → Server)
// -------------------------------------------------------
export const vnpayIpn = async (req, res) => {
  console.log("\n================= VNPAY IPN =================");
  console.log("📡 IPN QUERY:", req.query);

  return res.json({ RspCode: "00", Message: "OK" });
};
