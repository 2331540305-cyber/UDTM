import Product from "../models/productModel.js";
import ProductsDetails from "../models/productsDetailsModel.js";
import { createAdminLog, getChangedFields } from "../utils/logHelper.js";

// Lấy danh sách sản phẩm
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết 1 sản phẩm theo _id hoặc product_id
export const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    // thử theo ObjectId
    let product = null;
    if (id) {
      // nếu là ObjectId hợp lệ, tìm theo _id
      try {
        product = await Product.findById(id);
      } catch (e) {
        // bỏ qua lỗi cast
      }
      // nếu chưa tìm thấy, thử theo product_id (business code)
      if (!product) {
        product = await Product.findOne({ product_id: id });
      }
      // Nếu vẫn chưa tìm thấy trong collection `products`, thử trong `products_details`
      if (!product) {
        try {
          // thử theo _id trong products_details
          const detailsById = await ProductsDetails.findById(id);
          if (detailsById) product = detailsById;
        } catch (e) {
          
        }
      }
      if (!product) {
        const detailsByCode = await ProductsDetails.findOne({ product_id: id });
        if (detailsByCode) product = detailsByCode;
      }
    }

    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm sản phẩm mới
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, image_url, trailer, trailer_url } = req.body;

    const newProduct = await Product.create({
      product_id: "P" + Date.now(),
      name,
      description,
      price,
      stock,
      category,
      image_url,
      trailer_url,
      created_by: req.user._id, // từ middleware protect
    });

    // Ghi log nếu user là admin
    if (req.user && req.user.role === "admin") {
      await createAdminLog(
        req,
        "create_product",
        "product",
        newProduct.product_id,
        `Tạo mới sản phẩm: ${name}`,
        null,
        newProduct.toObject(),
        "success"
      );
    }

    res.status(201).json(newProduct);
  } catch (error) {
    // Ghi log lỗi nếu user là admin
    if (req.user && req.user.role === "admin") {
      await createAdminLog(
        req,
        "create_product",
        "product",
        null,
        `Lỗi tạo sản phẩm: ${req.body.name || "N/A"}`,
        null,
        req.body,
        "failed",
        error.message
      );
    }
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (req, res) => {
  try {
    const idParam = req.params.product_id || req.params.id;
    let product = null;
    try {
      product = await Product.findById(idParam);
    } catch (e) {
      // ignore cast error
    }
    if (!product) {
      product = await Product.findOne({ product_id: idParam });
    }
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    const oldProductData = product.toObject();
    Object.assign(product, req.body);
    const updated = await product.save();

    // Ghi log nếu user là admin
    if (req.user && req.user.role === "admin") {
      const changedFields = getChangedFields(oldProductData, req.body);
      await createAdminLog(
        req,
        "update_product",
        "product",
        product.product_id,
        `Cập nhật sản phẩm: ${product.name}. Thay đổi: ${Object.keys(changedFields).join(", ") || "không có"}`,
        oldProductData,
        updated.toObject(),
        "success"
      );
    }

    res.json(updated);
  } catch (error) {
    // Ghi log lỗi nếu user là admin
    if (req.user && req.user.role === "admin") {
      await createAdminLog(
        req,
        "update_product",
        "product",
        req.params.product_id || req.params.id,
        `Lỗi cập nhật sản phẩm: ${error.message}`,
        null,
        req.body,
        "failed",
        error.message
      );
    }
    res.status(500).json({ message: error.message });
  }
};

// Xóa sản phẩm
export const deleteProduct = async (req, res) => {
  try {
    const idParam = req.params.product_id || req.params.id;
    let product = null;
    try {
      product = await Product.findById(idParam);
    } catch (e) {
      // ignore
    }
    if (!product) {
      product = await Product.findOne({ product_id: idParam });
    }
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    const deletedProductData = product.toObject();
    await product.deleteOne();

    // Ghi log nếu user là admin
    if (req.user && req.user.role === "admin") {
      await createAdminLog(
        req,
        "delete_product",
        "product",
        product.product_id,
        `Xóa sản phẩm: ${product.name}`,
        deletedProductData,
        null,
        "success"
      );
    }

    res.json({ message: "Đã xóa sản phẩm" });
  } catch (error) {
    // Ghi log lỗi nếu user là admin
    if (req.user && req.user.role === "admin") {
      await createAdminLog(
        req,
        "delete_product",
        "product",
        req.params.product_id || req.params.id,
        `Lỗi xóa sản phẩm: ${error.message}`,
        null,
        null,
        "failed",
        error.message
      );
    }
    res.status(500).json({ message: error.message });
  }
};
