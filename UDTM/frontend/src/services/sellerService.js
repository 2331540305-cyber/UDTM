import api from "./api";

// Seller Services
export const sellerService = {
  // Get seller dashboard stats
  getDashboard: async () => {
    try {
      const response = await api.get("/seller/dashboard");
      return response.data;
    } catch (error) {
      console.error("Error fetching seller dashboard:", error);
      throw error;
    }
  },

  // Get seller's products
  getProducts: async () => {
    try {
      const response = await api.get("/seller/products");
      return response.data;
    } catch (error) {
      console.error("Error fetching seller products:", error);
      throw error;
    }
  },

  // Get seller's orders
  getOrders: async () => {
    try {
      const response = await api.get("/seller/orders");
      return response.data;
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      throw error;
    }
  },

  // Get seller's earnings
  getEarnings: async () => {
    try {
      const response = await api.get("/seller/earnings");
      return response.data;
    } catch (error) {
      console.error("Error fetching seller earnings:", error);
      throw error;
    }
  },

  // Create new product
  createProduct: async (productData) => {
    try {
      const response = await api.post("/seller/products", productData);
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (productId, productData) => {
    try {
      const response = await api.patch(`/seller/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/seller/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },
};

export default sellerService;
