import Report from "../models/reportModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

// 🧾 Tạo báo cáo (admin)
export const generateReport = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Only admin can create reports' });
    const { period_start, period_end } = req.body;
    let { report_type } = req.body || {};
    // Allow both kinds of report_type values: granularity and kind (sales/orders)
    const allowedTypes = ["daily", "monthly", "custom", "sales", "orders"];
    if (report_type) report_type = String(report_type).toLowerCase();
    if (report_type && !allowedTypes.includes(report_type)) {
      return res.status(400).json({ message: `Invalid report_type: ${report_type}` });
    }

    if (!period_start || !period_end) return res.status(400).json({ message: 'period_start and period_end are required' });
    const start = new Date(period_start);
    const end = new Date(period_end);
    if (isNaN(start) || isNaN(end)) return res.status(400).json({ message: 'Invalid date for period_start or period_end' });
    if (start > end) return res.status(400).json({ message: 'period_start must be before period_end' });

    // Tính tổng đơn hàng trong khoảng thời gian
    const orders = await Order.find({
      created_at: { $gte: start, $lte: end },
      order_status: "confirmed",
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);

    // Optional overrides submitted by admin
    const { notes: providedNotes } = req.body || {};
    let providedTotalRevenue = null;
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'total_revenue')) {
      providedTotalRevenue = parseFloat(req.body.total_revenue);
      if (isNaN(providedTotalRevenue) || providedTotalRevenue < 0) {
        return res.status(400).json({ message: 'total_revenue must be a non-negative number' });
      }
    }

    // Tìm top seller (giả định có buyer_id và seller_id)
    // Compute basic top seller/product metrics if we have orders
    let topSeller = "Chưa có dữ liệu seller"; // placeholder cho sau này
    let topProduct = "Chưa có dữ liệu sản phẩm";
    if (orders.length > 0) {
      // Find seller with most orders
      const sellerCounts = {};
      const productCounts = {};
      for (const o of orders) {
        if (o.seller_id) sellerCounts[o.seller_id] = (sellerCounts[o.seller_id] || 0) + 1;
        // o.items expected - count product occurrences
        if (Array.isArray(o.items)) {
          for (const it of o.items) {
            if (it.product_id) productCounts[it.product_id] = (productCounts[it.product_id] || 0) + 1;
          }
        }
      }
      const topSellerId = Object.keys(sellerCounts).sort((a,b)=>sellerCounts[b]-sellerCounts[a])[0];
      const topProductId = Object.keys(productCounts).sort((a,b)=>productCounts[b]-productCounts[a])[0];
      topSeller = topSellerId || topSeller;
      topProduct = topProductId || topProduct;
    }

    const report = await Report.create({
      report_id: "R" + Date.now(),
      report_type,
      period_start: start,
      period_end: end,
      total_revenue: (providedTotalRevenue !== null ? providedTotalRevenue : totalRevenue),
      total_orders: totalOrders,
      top_seller: topSeller,
      top_product: topProduct,
      notes: (providedNotes ? String(providedNotes).trim() : `Generated ${report_type || 'sales'} report with ${totalOrders} orders and ${totalRevenue} revenue for ${start.toISOString()} - ${end.toISOString()}`),
      // created_at and updated_at are provided by mongoose timestamps option
    });

    res.status(201).json(report);
  } catch (error) {
    console.error("🔥 Lỗi khi tạo báo cáo:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📈 Lấy tất cả báo cáo
export const getReports = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Only admin can view reports' });
    const reports = await Report.find().sort({ created_at: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📋 Lấy báo cáo chi tiết theo ID
export const getReportById = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Only admin can view reports' });
    const report = await Report.findOne({ report_id: req.params.report_id || req.params.id });
    if (!report) return res.status(404).json({ message: "Không tìm thấy báo cáo" });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
