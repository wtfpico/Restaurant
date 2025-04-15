import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./Analytics.css"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton, Alert, DatePicker, Card, Statistic,Switch } from "antd";
import moment from "moment";

const { RangePicker } = DatePicker;
const socket = io("http://localhost:4000", { reconnectionAttempts: 3 });

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28DFF",
  "#FF6B6B",
];

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({});
  const [orderTrends, setOrderTrends] = useState([]);
  const [orderCategories, setOrderCategories] = useState([]);
  const [predictedRevenue, setPredictedRevenue] = useState([]);
  const [loading, setLoading] = useState({
    general: true,
    trends: true,
    categories: true,
  });
  const [loadingPrediction, setLoadingPrediction] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([
    moment().subtract(30, "days"),
    moment(),
  ]);
  const [modelMetrics, setModelMetrics] = useState({});
  const [inputSummary, setInputSummary] = useState({});
  const [comparisonData, setComparisonData] = useState([]);
  const [showComparisonChart, setShowComparisonChart] = useState(false);

  const fetchData = async () => {
    try {
      setLoading({ general: true, trends: true, categories: true });
      setError(null);

      const [generalRes, trendsRes, categoriesRes] = await Promise.all([
        axios.get("http://localhost:4000/api/analytics/general"),
        axios.get("http://localhost:4000/api/analytics/trends", {
          params: {
            startDate: dateRange[0].format("YYYY-MM-DD"),
            endDate: dateRange[1].format("YYYY-MM-DD"),
          },
        }),
        axios.get("http://localhost:4000/api/analytics/order-categories"),
      ]);

      setAnalytics(generalRes.data.data);
      setOrderTrends(trendsRes.data.data);
      setOrderCategories(categoriesRes.data.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data. Please try again later.");
    } finally {
      setLoading({ general: false, trends: false, categories: false });
    }
  };

  const fetchPrediction = async () => {
    try {
      setLoadingPrediction(true);
      const res = await axios.get(
        "http://localhost:4000/api/analytics/predict-revenue"
      );
      const forecast = res.data.data.forecast;
      setPredictedRevenue(forecast);
      setModelMetrics(res.data.data.modelMetrics);
      setInputSummary(res.data.data.inputSummary);

      const combinedMap = {};

      // Loop through real revenue trends
      orderTrends.forEach(({ _id, totalAmount }) => {
        combinedMap[_id] = {
          date: _id,
          actual: totalAmount,
          predicted: undefined,
        };
      });

      // Loop through predictions
      forecast.forEach(({ date, predictedRevenue }) => {
        if (combinedMap[date]) {
          combinedMap[date].predicted = predictedRevenue;
        } else {
          combinedMap[date] = {
            date,
            actual: undefined,
            predicted: predictedRevenue,
          };
        }
      });

      // Sort by date
      const merged = Object.values(combinedMap).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      setComparisonData(merged);
    } catch (err) {
      console.error("Error fetching predicted revenue:", err);
    } finally {
      setLoadingPrediction(false);
    }
  };

  useEffect(() => {
    if (orderTrends.length > 0) {
      fetchPrediction();
    }
  }, [orderTrends]);


  useEffect(() => {
    fetchData();
    

    socket.on("newOrder", () => {
      console.log("New order received, refreshing analytics...");
      fetchData();
      
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setError("Realtime updates unavailable. Data may be stale.");
    });

    return () => {
      socket.off("newOrder");
      socket.off("connect_error");
    };
  }, [dateRange]);

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
    }
  };

  const generalAnalyticsData = [
    { name: "Total Orders", value: analytics.totalOrders || 0 },
    { name: "Total Users", value: analytics.totalUsers || 0 },
    { name: "Total Revenue", value: analytics.totalRevenue || 0 },
    { name: "Avg. Order Value", value: analytics.avgOrderValue || 0 },
  ];

  if (error) {
    return (
      <div className="p-4">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <RangePicker
          value={dateRange}
          onChange={handleDateChange}
          disabledDate={(current) => current && current > moment().endOf("day")}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <Statistic
            title="Total Orders"
            value={analytics.totalOrders || 0}
            loading={loading.general}
          />
        </Card>
        <Card>
          <Statistic
            title="Total Revenue"
            prefix="$"
            value={analytics.totalRevenue || 0}
            precision={2}
            loading={loading.general}
          />
        </Card>
        <Card>
          <Statistic
            title="Active Users"
            value={analytics.totalUsers || 0}
            loading={loading.general}
          />
        </Card>
        <Card>
          <Statistic
            title="Avg. Order Value"
            prefix="$"
            value={analytics.avgOrderValue || 0}
            precision={2}
            loading={loading.general}
          />
        </Card>
      </div>

      {/* General Analytics Chart */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h3 className="text-lg font-semibold mb-2">General Analytics</h3>
        {loading.general ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={generalAnalyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}`, "Value"]} />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Analytics Overview" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Trends */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Order Trends</h3>
          {loading.trends ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue Trends */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Revenue Trends</h3>
          {loading.trends ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={orderTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalAmount"
                  stroke="#82ca9d"
                  name="Revenue"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Comparison Toggle + Chart */}
      <div className="flex items-center justify-between mb-4 mt-6">
        <h3 className="text-lg font-semibold">Actual vs Predicted Revenue</h3>
        <Switch
          checked={showComparisonChart}
          onChange={setShowComparisonChart}
          checkedChildren="Shown"
          unCheckedChildren="Hidden"
        />
      </div>

      {showComparisonChart && (
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          {comparisonData.length === 0 ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(dateStr) => moment(dateStr).format("MMM D")}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `$${value?.toFixed(2)}`,
                    name === "actual" ? "Actual Revenue" : "Predicted Revenue",
                  ]}
                  labelFormatter={(label) =>
                    moment(label).format("MMMM D, YYYY")
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#0088FE"
                  strokeWidth={2}
                  name="Actual Revenue"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#FF7300"
                  strokeWidth={2}
                  name="Predicted Revenue"
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Predicted Revenue Section */}
      <div className="bg-white p-4 rounded-xl shadow mt-6">
        <h3 className="text-lg font-semibold mb-4">
          Predicted Revenue (Next 7 Days)
        </h3>

        {loadingPrediction ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : predictedRevenue && predictedRevenue.length > 0 ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <Statistic
                  title="Total Predicted Revenue"
                  prefix="$"
                  value={predictedRevenue
                    .reduce((sum, item) => sum + item.predictedRevenue, 0)
                    .toFixed(2)}
                />
              </Card>
              <Card>
                <Statistic
                  title="Avg. Predicted Daily Revenue"
                  prefix="$"
                  value={(
                    predictedRevenue.reduce(
                      (sum, item) => sum + item.predictedRevenue,
                      0
                    ) / predictedRevenue.length
                  ).toFixed(2)}
                />
              </Card>
              <Card>
                <Statistic
                  title="R² Score (Model Accuracy)"
                  value={modelMetrics?.rSquared ?? 0}
                  precision={3}
                />
              </Card>
            </div>

            {/* Forecast Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={predictedRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(dateStr) => moment(dateStr).format("MMM D")}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `$${value.toFixed(2)}`,
                    "Predicted Revenue",
                  ]}
                  labelFormatter={(label) =>
                    moment(label).format("MMMM D, YYYY")
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="predictedRevenue"
                  stroke="#ff7300"
                  strokeWidth={2}
                  name="Predicted Revenue"
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Input Summary */}
            <div className="mt-6 text-sm text-gray-600">
              <p>
                <strong>Input Period:</strong> {inputSummary?.startDate} to{" "}
                {inputSummary?.endDate}
              </p>
              <p>
                <strong>Total Revenue Used:</strong> $
                {inputSummary?.totalRevenue}
              </p>
              <p>
                <strong>Average Daily Revenue:</strong> $
                {inputSummary?.averageDailyRevenue}
              </p>
              <p>
                <strong>Model Coefficient:</strong> {modelMetrics?.coefficient}
              </p>
              <p>
                <strong>Intercept:</strong> {modelMetrics?.intercept}
              </p>
            </div>
          </>
        ) : (
          <Alert
            message="Error"
            description={
              <>
                {error}
                <br />
                <button
                  onClick={fetchData}
                  className="mt-2 text-blue-600 underline"
                >
                  Retry
                </button>
              </>
            }
            type="error"
            showIcon
          />
        )}
      </div>

      {/* Order Categories Breakdown (Pie Chart) */}
      <div className="bg-white p-4 rounded-xl shadow mt-6">
        <h3 className="text-lg font-semibold mb-2">
          Order Categories Breakdown
        </h3>
        {loading.categories ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderCategories}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {orderCategories.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;