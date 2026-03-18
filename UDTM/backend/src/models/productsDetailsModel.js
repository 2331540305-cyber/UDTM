import mongoose from "mongoose";

// Flexible schema for products_details collection — allow unknown fields
const productsDetailsSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

// Explicitly map to 'products_details' collection
const ProductsDetails = mongoose.model("ProductsDetails", productsDetailsSchema, "products_details");

export default ProductsDetails;
