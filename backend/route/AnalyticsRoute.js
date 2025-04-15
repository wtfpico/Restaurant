import express from "express";
import OrderModel from "../models/OrderModel.js";
import { spawn } from "child_process";
import {
  getGeneralAnalytics,
  getOrderTrends,
  getOrderTrendsByDate,
  getOrderCategories,
} from "../controllers/AnalyticsController.js";
import { validateDateRange } from "../middleware/analyticsValidation.js";

const router = express.Router();

// Other analytics endpoints
router.get("/general", getGeneralAnalytics);
router.get("/trends", getOrderTrends);
router.get("/trends-by-date", validateDateRange, getOrderTrendsByDate);
router.get("/order-categories", getOrderCategories);


router.get("/predict-revenue", validateDateRange, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const salesData = await OrderModel.aggregate([
      {
        $match: {
          date: Object.keys(dateFilter).length ? dateFilter : { $exists: true },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalRevenue: { $sum: "$amount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          totalRevenue: 1,
          orderCount: 1,
          _id: 0,
        },
      },
    ]);

    if (salesData.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Insufficient data (minimum 7 days required)",
        daysAvailable: salesData.length,
      });
    }

    const inputData = JSON.stringify(
      salesData.map((d) => ({
        date: d.date,
        totalRevenue: d.totalRevenue,
      }))
    );

    const pythonProcess = spawn("python", ["./analytics/revenue_forecast.py"]);

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("Python stderr:", errorOutput);
        return res.status(500).json({
          success: false,
          error: "Python script failed",
          details: errorOutput,
        });
      }

      try {
        const parsed = JSON.parse(output);

        if (!parsed.success) {
          return res.status(500).json({
            success: false,
            error: parsed.error || "Forecast computation error",
          });
        }

        res.json({
          success: true,
          data: {
            forecast: parsed.data.forecast,
            modelMetrics: parsed.data.modelMetrics,
            inputSummary: {
              startDate: salesData[0].date,
              endDate: salesData[salesData.length - 1].date,
              totalDays: salesData.length,
              totalRevenue: salesData.reduce(
                (sum, d) => sum + d.totalRevenue,
                0
              ),
              averageDailyRevenue: Math.round(
                salesData.reduce((sum, d) => sum + d.totalRevenue, 0) /
                  salesData.length
              ),
            },
          },
        });
      } catch (parseErr) {
        console.error("Parsing error:", parseErr.message);
        res.status(500).json({
          success: false,
          error: "Failed to parse Python output",
        });
      }
    });

    // Write input to Python
    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end();
  } catch (error) {
    console.error("Revenue prediction error:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error.message,
    });
  }
});


export default router;
