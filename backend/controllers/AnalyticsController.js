import OrderModel from "../models/OrderModel.js";
import UserModel from "../models/UserModel.js";

// Utility function to calculate total revenue
const calculateTotalRevenue = async () => {
  const totalRevenue = await OrderModel.aggregate([
    { $match: { status: { $in: ["Completed", "Delivered"] } } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);
  return totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0;
};

// General Analytics
export const getGeneralAnalytics = async (req, res) => {
  try {
    const totalOrders = await OrderModel.countDocuments();
    const totalUsers = await UserModel.countDocuments();

    // Total revenue from completed/delivered orders
    const totalRevenue = await calculateTotalRevenue();

    // Monthly revenue trends
    const monthlyRevenue = await OrderModel.aggregate([
      { $match: { status: { $in: ["Completed"] } } },
      {
        $group: {
          _id: { $month: "$date" },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Predict next month's revenue using a simple moving average
    const revenueValues = monthlyRevenue.map((data) => data.revenue);
    const predictedRevenue =
      revenueValues.length >= 3
        ? revenueValues.slice(-3).reduce((sum, val) => sum + val, 0) / 3 // 3-month moving average
        : revenueValues.length > 0
        ? revenueValues.reduce((sum, val) => sum + val, 0) /
          revenueValues.length
        : 0;

    // Order status breakdown
    const orderStatusBreakdown = await OrderModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      success: true,
      data: {
        totalOrders,
        totalUsers,
        totalRevenue,
        monthlyRevenue,
        predictedRevenue, // New predicted revenue
        orderStatusBreakdown,
        avgOrderValue: avgOrderValue.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Order Trends (e.g., Daily, Weekly, Monthly)
export const getOrderTrends = async (req, res) => {
  try {
    const period = req.query.period || "daily"; // Default to daily
    let dateFormat = "%Y-%m-%d"; // Default daily grouping

    if (period === "weekly") {
      dateFormat = "%Y-%U"; // Group by year-week (Week Number)
    } else if (period === "monthly") {
      dateFormat = "%Y-%m"; // Group by year-month
    }

    const trends = await OrderModel.aggregate([
      { $match: { payment: true } }, // Only include paid orders
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$date" } },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: trends });
  } catch (error) {
    console.error("Error fetching order trends:", error);
    res.status(500).json({ success: false, message: "Error fetching trends" });
  }
};

// Order Trends by Date
export const getOrderTrendsByDate = async (req, res) => {
  try {
    const ordersByDate = await OrderModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, // Group by date
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date
    ]);

    res.json({
      success: true,
      data: ordersByDate,
    });
  } catch (error) {
    console.error("Error fetching order trends by date:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Order Categories
export const getOrderCategories = async (req, res) => {
  try {
    const categories = await OrderModel.aggregate([
      { $unwind: "$items" }, // Flatten the items array
      {
        $group: {
          _id: "$items.category.name", // Extract category name
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching order categories:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
