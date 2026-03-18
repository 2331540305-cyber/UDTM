import Category from "../models/categoryModel.js";

// ➕ Thêm danh mục
export const createCategory = async (req, res) => {
  try {
    const { category_name, description, parent_id } = req.body;

    const exist = await Category.findOne({ category_name });
    if (exist) return res.status(400).json({ message: "Tên danh mục đã tồn tại" });

    const newCategory = await Category.create({
      category_id: "CAT" + Date.now(),
      category_name,
      description,
      parent_id: parent_id || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📋 Lấy tất cả danh mục
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ created_at: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔎 Lấy danh mục theo ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({ category_id: req.params.id });
    if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Cập nhật danh mục
export const updateCategory = async (req, res) => {
  try {
    const { category_name, description, parent_id } = req.body;

    const category = await Category.findOne({ category_id: req.params.id });
    if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });

    category.category_name = category_name || category.category_name;
    category.description = description || category.description;
    category.parent_id = parent_id || category.parent_id;
    category.updated_at = new Date();

    await category.save();
    res.json({ message: "Cập nhật thành công", category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🗑️ Xóa danh mục
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ category_id: req.params.id });
    if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });

    await category.deleteOne();
    res.json({ message: "Đã xóa danh mục" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
