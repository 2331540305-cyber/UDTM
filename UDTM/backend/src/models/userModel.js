import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    full_name: String,
    phone: String,
    address: String,
    role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
    //  Thêm trường cho Google Login (không bắt buộc, tùy chọn)
    googleUid: { type: String, sparse: true },
    photoURL: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//  BẮT BUỘC: chỉ định rõ collection là 'users'
const User = mongoose.model("User", userSchema, "users");

export default User;
