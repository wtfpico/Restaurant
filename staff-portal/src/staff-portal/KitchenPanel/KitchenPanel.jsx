import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Tag, Select, Button, Spin, message, Layout } from "antd";
import {
  ClockCircleOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  LogoutOutlined,
  FireOutlined,
} from "@ant-design/icons";
import "./KitchenPanel.css";

const { Option } = Select;
const url = "http://localhost:4000";

const KitchenPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const statusMap = {
    "Food Processing": { color: "orange", icon: <ClockCircleOutlined /> },
    "Out for Delivery": { color: "blue", icon: <CarOutlined /> },
    Delivered: { color: "green", icon: <CheckCircleOutlined /> },
    Completed: { color: "green", icon: <CheckCircleOutlined /> },
    Cancelled: { color: "red", icon: <ExclamationCircleOutlined /> },
  };

  
  const fetchAllOrders = async (params = {}) => {
    setLoading(true);
    try {
      const currentPage = params.page || pagination.current;
      const limit = params.limit || pagination.pageSize;

      const response = await axios.get(`${url}/api/order/list`, {
        params: {
          page: currentPage,
          limit,
          status: "Food Processing", // Hint to backend
        },
      });

      if (response.data.success) {
        // Filter again on frontend to be safe
        const processingOrders = response.data.data.filter(
          (order) => order.status === "Food Processing"
        );

        setOrders(processingOrders);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total || processingOrders.length,
          current: currentPage,
          pageSize: limit,
        }));
      } else {
        message.error(response.data.message || "Failed to fetch orders.");
      }
    } catch (error) {
      message.error("Error fetching orders. Please try again.");
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status,
      });

      if (response.data.success) {
        message.success("Order status updated successfully");

        // Remove from the list if not Food Processing anymore
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== orderId)
        );
      } else {
        message.error(response.data.message || "Failed to update status.");
      }
    } catch (error) {
      message.error("Error updating order status.");
      console.error("Update Error:", error);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));

    fetchAllOrders({
      page: newPagination.current,
      limit: newPagination.pageSize,
    });
  };

  const refreshOrders = () => {
    fetchAllOrders();
  };

  useEffect(() => {
    fetchAllOrders();

    const interval = setInterval(() => {
      fetchAllOrders();
    }, 30000); // Auto-refresh every 30s

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "_id",
      render: (id) => (
        <span className="order-id">#{id.slice(-6).toUpperCase()}</span>
      ),
      width: 120,
    },
   
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (items) => (
        <div className="order-items">
          {items.map((item, i) => (
            <div key={i} className="item">
              {item.name} × {item.quantity}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={statusMap[status]?.color || "default"}
          icon={statusMap[status]?.icon}
        >
          {status}
        </Tag>
      ),
      width: 180,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, order) =>
        order.status === "Food Processing" ? (
          <Select
            defaultValue={order.status}
            onChange={(value) => updateStatus(order._id, value)}
            style={{ width: 180 }}
          >
            <Option value="Out for Delivery">Mark as Out for Delivery</Option>
          </Select>
        ) : (
          <Tag color="gray">No Actions</Tag>
        ),
      width: 200,
    },
  ];

  const Navbar = () => (
    <div className="navbar">
      <h1>
        <FireOutlined style={{ color: "orangered" }} /> Kitchen
      </h1>
      <Button
        type="primary"
        danger
        onClick={() => {
          window.location.href = "http://localhost:5173/staff/login";
        }}
        icon={<LogoutOutlined />}
      >
        Logout
      </Button>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="orders-container">
        <div className="orders-header">
          <div className="controls">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={refreshOrders}
            >
              Refresh
            </Button>
          </div>
        </div>

        <div className="orders-table">
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="_id"
              pagination={pagination}
              onChange={handleTableChange}
              scroll={{ x: 1300 }}
              bordered
              size="middle"
              locale={{
                emptyText: (
                  <div className="empty-orders">
                    <p>No orders found</p>
                    <Button type="primary" onClick={refreshOrders}>
                      Refresh
                    </Button>
                  </div>
                ),
              }}
            />
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default KitchenPanel;
