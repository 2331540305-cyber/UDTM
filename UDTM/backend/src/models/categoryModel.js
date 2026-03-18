import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    category_id: { type: String, required: true, unique: true },
    category_name: { type: String, required: true },
    description: { type: String },
    parent_id: { type: String, default: null }, // id danh mục cha
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const Category = mongoose.model("Category", categorySchema, "categories");
export default Category;
