import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    product_id: { type: String, required: true, unique: true },
    seller_id: { type: String },
    category_id: { type: String },
    product_name: { type: String, required: true },
    short_description: { type: String },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    category: { type: String },
    photo: { type: String }, // Cloudinary image URL
    image_url: { type: String }, // Legacy support
    trailer: { type: String }, // URL to product trailer (YouTube or direct video URL)
    trailer_url: { type: String }, // Alternative field for trailer URL
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const Product = mongoose.model("Product", productSchema, "products");

export default Product;
