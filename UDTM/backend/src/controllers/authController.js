import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

// 🪪 Hàm tạo token JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "default_secret", {
    expiresIn: "30d",
  });
};

// 🧱 Đăng ký
export const registerUser = async (req, res) => {
  try {
    const { full_name, username, email, phone, password, address, status } = req.body;

    // Log dữ liệu nhận được
    console.log("📝 Dữ liệu đăng ký nhận được:", {
      full_name,
      username,
      email,
      phone,
      password: password ? "***" : "không có",
      address,
      role,
      status,
    });

    // Validation với log chi tiết
    const missingFields = [];
    if (!full_name) missingFields.push("full_name (Tên đầy đủ)");
    if (!username) missingFields.push("username (Tên đăng nhập)");
    if (!email) missingFields.push("email (Email)");
    if (!phone) missingFields.push("phone (Số điện thoại)");
    if (!password) missingFields.push("password (Mật khẩu)");
    if (!address) missingFields.push("address (Địa chỉ)");

    if (missingFields.length > 0) {
      console.warn("⚠️ Thiếu thông tin đăng ký:", missingFields.join(", "));
      return res.status(400).json({ 
        message: "Vui lòng nhập đầy đủ thông tin!",
        missingFields 
      });
    }

    console.log("✅ Tất cả thông tin hợp lệ");

    // Kiểm tra email hoặc username hoặc phone đã tồn tại
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phone }],
    });

    if (existingUser) {
      let field = "";
      if (existingUser.email === email) field = "Email";
      if (existingUser.username === username) field = "Tên đăng nhập";
      if (existingUser.phone === phone) field = "Số điện thoại";
      
      console.warn(`⚠️ ${field} đã tồn tại:`, existingUser);
      return res.status(400).json({ message: `${field} đã tồn tại!` });
    }

    // Tạo user_id duy nhất
    const user_id = "U" + Date.now();

    console.log("🔐 Tạo user mới với ID:", user_id);

    // Tạo user mới (lưu password dạng text theo yêu cầu)
    const user = await User.create({
      user_id,
      username,
      email,
      password, // không mã hóa
      full_name,
      phone,
      address,
      // Đảm bảo role mặc định là buyer khi register công khai
      role: "buyer",
      status: status || "active",
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log("✅ Người dùng đăng ký thành công:", {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });

    res.status(201).json({
      message: "Đăng ký thành công!",
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        full_name: user.full_name,
        address: user.address,
        role: user.role,
        status: user.status,
      },
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error("❌ Lỗi registerUser:", error.message);
    console.error("Chi tiết lỗi:", error);
    res.status(500).json({ message: "Lỗi server khi đăng ký" });
  }
};

// 🔥 Đăng nhập Google
export const googleLogin = async (req, res) => {
  try {
    const { email, displayName, googleUid, photoURL } = req.body;

    console.log("\n🔹 === GOOGLE LOGIN ===");
    console.log("📝 Dữ liệu từ Google:", { email, displayName, googleUid });

    if (!email || !googleUid) {
      console.warn("⚠️ Thiếu email hoặc googleUid");
      return res.status(400).json({ message: "Thiếu thông tin từ Google!" });
    }

    // Bước 1: Tìm user trong database theo email
    console.log("🔍 Tìm kiếm user với email:", email);
    let user = await User.findOne({ email });

    if (!user) {
      console.warn("⚠️ Không tìm thấy user với email:", email);
      return res.status(404).json({ 
        message: "Email này chưa được đăng ký! Vui lòng đăng ký trước.",
        requiresRegistration: true,
        email,
        displayName,
      });
    }

    console.log("✅ Tìm thấy user:", {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
    });

    // Bước 2: Cập nhật googleUid nếu chưa có (tùy chọn)
    if (!user.googleUid) {
      user.googleUid = googleUid;
      user.photoURL = photoURL || user.photoURL;
      await user.save();
      console.log("📝 Cập nhật googleUid cho user");
    }

    // Bước 3: Tạo JWT token
    const token = generateToken(user._id, user.role);

    console.log("✅ Đăng nhập Google thành công:", {
      user_id: user.user_id,
      username: user.username,
      role: user.role,
    });

    res.status(200).json({
      message: "Đăng nhập Google thành công!",
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      full_name: user.full_name,
      address: user.address,
      role: user.role,
      photoURL: user.photoURL,
      token,
    });
  } catch (error) {
    console.error("❌ Lỗi googleLogin:", error.message);
    console.error("Chi tiết lỗi:", error);
    res.status(500).json({ message: "Lỗi server khi đăng nhập Google" });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Thiếu thông tin đăng nhập!" });
    }

    // 🔍 Tìm user
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier },
        { phone: identifier },
        { mssv: identifier },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    // 🔐 So sánh trực tiếp mật khẩu
    if (user.password !== password) {
      return res.status(401).json({ message: "Sai mật khẩu!" });
    }

    // 🎫 Tạo JWT token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("🔥 Lỗi loginUser:", error);
    res.status(500).json({ message: "Lỗi server khi đăng nhập!" });
  }
};
