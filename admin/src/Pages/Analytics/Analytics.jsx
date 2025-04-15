import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
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
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import {
  Skeleton,
  Alert,
  DatePicker,
  Card,
  Statistic,
  Switch,
  Row,
  Col,
  Progress,
  Empty,
} from "antd";
import moment from "moment";
import {
  DollarOutlined,
  UserOutlined,
  ShoppingOutlined,
  AreaChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import "./Analytics.css";

const { RangePicker } = DatePicker;
const socket = io("http://localhost:4000", {
  reconnectionAttempts: 3,
  transports: ["websocket"],
});

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
  const [socketConnected, setSocketConnected] = useState(false);

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
        "http://localhost:4000/api/analytics/predict-revenue",
        {
          params: {
            days: 7,
            confidence: 0.95,
          },
        }
      );

      if (res.data.success) {
        const { forecast, modelMetrics, inputSummary } = res.data.data;
        setPredictedRevenue(forecast);
        setModelMetrics(modelMetrics);
        setInputSummary(inputSummary);

        // Create combined dataset for comparison
        const today = moment().format("YYYY-MM-DD");
        const combined = [
          ...orderTrends.map((item) => ({
            date: item._id,
            actual: item.totalAmount,
            predicted:
              item._id === today ? forecast[0]?.predictedRevenue : null,
            type: "actual",
          })),
          ...forecast.map((item) => ({
            date: item.date,
            actual: null,
            predicted: item.predictedRevenue,
            type: "forecast",
          })),
        ].sort((a, b) => moment(a.date).diff(moment(b.date)));

        setComparisonData(combined);
      }
    } catch (err) {
      console.error("Error fetching predicted revenue:", err);
      setError("Failed to load revenue predictions");
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

    socket.on("connect", () => {
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

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
      socket.disconnect();
    };
  }, [dateRange]);

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      const daysDiff = dates[1].diff(dates[0], "days");
      if (daysDiff > 365) {
        Alert.warning("Maximum date range is 1 year. Showing last 365 days.");
        setDateRange([moment().subtract(365, "days"), moment()]);
      } else {
        setDateRange(dates);
      }
    }
  };

  const generalAnalyticsData = [
    {
      name: "Total Orders",
      value: analytics.totalOrders || 0,
      icon: <ShoppingOutlined />,
      color: "#1890ff",
    },
    {
      name: "Total Users",
      value: analytics.totalUsers || 0,
      icon: <UserOutlined />,
      color: "#52c41a",
    },
    {
      name: "Total Revenue",
      value: analytics.totalRevenue || 0,
      icon: <DollarOutlined />,
      color: "#faad14",
    },
    {
      name: "Avg. Order Value",
      value: analytics.avgOrderValue || 0,
      icon: <AreaChartOutlined />,
      color: "#722ed1",
    },
  ];

  const renderTooltip = (value, name) => {
    if (name === "Total Revenue" || name === "Avg. Order Value") {
      return [`$${value.toFixed(2)}`, name];
    }
    return [value, name];
  };

  if (error) {
    return (
      <div className="analytics-container">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={fetchData}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>
          <AreaChartOutlined /> Analytics Dashboard
          {socketConnected && (
            <Tag color="green" style={{ marginLeft: 10 }}>
              Live Updates
            </Tag>
          )}
        </h2>
        <RangePicker
          value={dateRange}
          onChange={handleDateChange}
          disabledDate={(current) => current && current > moment().endOf("day")}
          ranges={{
            Today: [moment(), moment()],
            "This Week": [moment().startOf("week"), moment().endOf("week")],
            "This Month": [moment().startOf("month"), moment().endOf("month")],
            "Last 30 Days": [moment().subtract(30, "days"), moment()],
          }}
        />
      </div>

      {/* Stats Cards */}
      <Row gutter={16} className="stats-row">
        {generalAnalyticsData.map((item, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card>
              <Statistic
                title={item.name}
                value={item.value}
                prefix={item.icon}
                precision={item.name.includes("Revenue") ? 2 : 0}
                valueStyle={{ color: item.color }}
                loading={loading.general}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* General Analytics Chart */}
      <Card
        title="General Analytics"
        loading={loading.general}
        className="chart-card"
      >
        {!loading.general && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={generalAnalyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={renderTooltip} />
              <Legend />
              <Bar
                dataKey="value"
                fill="#8884d8"
                name="Analytics Overview"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Row gutter={16} className="trends-row">
        {/* Order Trends */}
        <Col xs={24} md={12}>
          <Card
            title="Order Trends"
            loading={loading.trends}
            className="chart-card"
          >
            {!loading.trends && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orderTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#8884d8"
                    name="Orders"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        {/* Revenue Trends */}
        <Col xs={24} md={12}>
          <Card
            title="Revenue Trends"
            loading={loading.trends}
            className="chart-card"
          >
            {!loading.trends && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={orderTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`$${value.toFixed(2)}`, "Revenue"]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalAmount"
                    stroke="#82ca9d"
                    name="Revenue"
                    strokeWidth={2}
                    dot={false}
                  />
                  <ReferenceLine y={0} stroke="#000" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      {/* Comparison Chart */}
      <Card
        title={
          <div className="comparison-header">
            <span>Actual vs Predicted Revenue</span>
            <Switch
              checked={showComparisonChart}
              onChange={setShowComparisonChart}
              checkedChildren="Shown"
              unCheckedChildren="Hidden"
            />
          </div>
        }
        className="chart-card"
      >
        {showComparisonChart &&
          (loadingPrediction ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : comparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
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
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#FF7300"
                  strokeWidth={2}
                  name="Predicted Revenue"
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <ReferenceArea
                  x1={moment().format("YYYY-MM-DD")}
                  x2={moment().add(7, "days").format("YYYY-MM-DD")}
                  fill="rgba(255, 215, 0, 0.1)"
                  label="Forecast"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="No comparison data available" />
          ))}
      </Card>

      {/* Predicted Revenue Section */}
      <Card
        title="Revenue Forecast (Next 7 Days)"
        loading={loadingPrediction}
        className="chart-card"
      >
        {!loadingPrediction && predictedRevenue.length > 0 ? (
          <>
            <Row gutter={16} className="forecast-metrics">
              <Col xs={24} md={8}>
                <Card>
                  <Statistic
                    title="Total Predicted Revenue"
                    prefix="$"
                    value={predictedRevenue
                      .reduce((sum, item) => sum + item.predictedRevenue, 0)
                      .toFixed(2)}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card>
                  <Statistic
                    title="Avg. Daily Revenue"
                    prefix="$"
                    value={(
                      predictedRevenue.reduce(
                        (sum, item) => sum + item.predictedRevenue,
                        0
                      ) / predictedRevenue.length
                    ).toFixed(2)}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card>
                  <div className="model-accuracy">
                    <span>Model Accuracy (R²)</span>
                    <Progress
                      percent={modelMetrics?.rSquared * 100 || 0}
                      status={
                        modelMetrics?.rSquared > 0.8
                          ? "success"
                          : modelMetrics?.rSquared > 0.6
                          ? "normal"
                          : "exception"
                      }
                      format={(percent) => `${(percent / 100).toFixed(3)}`}
                    />
                  </div>
                </Card>
              </Col>
            </Row>

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
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <ReferenceLine y={0} stroke="#000" />
              </LineChart>
            </ResponsiveContainer>

            <div className="model-details">
              <h4>Model Details</h4>
              <Row gutter={16}>
                <Col span={12}>
                  <p>
                    <strong>Input Period:</strong> {inputSummary?.startDate} to{" "}
                    {inputSummary?.endDate}
                  </p>
                  <p>
                    <strong>Total Revenue:</strong> $
                    {inputSummary?.totalRevenue}
                  </p>
                </Col>
                <Col span={12}>
                  <p>
                    <strong>Avg. Daily Revenue:</strong> $
                    {inputSummary?.averageDailyRevenue}
                  </p>
                  <p>
                    <strong>Model Equation:</strong> y ={" "}
                    {modelMetrics?.coefficient}x + {modelMetrics?.intercept}
                  </p>
                </Col>
              </Row>
            </div>
          </>
        ) : (
          <Empty description="No forecast data available" />
        )}
      </Card>

      {/* Order Categories Breakdown */}
      <Card
        title={
          <div className="categories-header">
            <PieChartOutlined /> Order Categories Breakdown
          </div>
        }
        loading={loading.categories}
        className="chart-card"
      >
        {!loading.categories && orderCategories.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={orderCategories}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
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
              <Tooltip formatter={(value, name) => [`${value} orders`, name]} />
              <Legend layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="No category data available" />
        )}
      </Card>
    </div>
  );
};

export default AnalyticsPage;
