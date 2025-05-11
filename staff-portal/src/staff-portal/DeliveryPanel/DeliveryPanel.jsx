import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Table,
  Tag,
  Button,
  Spin,
  Layout,
  Input,
  Tooltip,
  notification,
  Modal,
} from "antd";
import {
  CarOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  LogoutOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import "./DeliveryPanel.css";

const { Header, Content } = Layout;
const API_URL = "http://localhost:4000";

let soundTimeout;
const playNotificationSound = () => {
  clearTimeout(soundTimeout);
  soundTimeout = setTimeout(() => {
    const audio = new Audio("/sounds/notification.mp3");
    audio.play().catch((err) => {
      console.warn("Audio play failed:", err);
    });
  }, 100);
};


const statusMap = {
  "Out for Delivery": { color: "blue", icon: <CarOutlined /> },
  Delivered: { color: "green", icon: <CheckCircleOutlined /> },
};

const DeliveryPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const previousOrderIds = useRef(new Set());

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/order/list`);
      if (res.data.success) {
        const filtered = res.data.data.filter(
          (order) => order.status === "Out for Delivery"
        );

        const newOrderIds = new Set(filtered.map((o) => o._id));
        const isNewOrder = [...newOrderIds].some(
          (id) => !previousOrderIds.current.has(id)
        );

        if (isNewOrder) {
          playNotificationSound();
          notification.info({
            message: "New Order",
            description: "A new delivery order has been added.",
            placement: "bottomRight",
          });
        }

        previousOrderIds.current = newOrderIds;
        setOrders(filtered);
      } else {
        notification.error({
          message: "Fetch Failed",
          description: res.data.message || "Failed to fetch orders.",
          placement: "bottomRight",
        });
      }
    } catch (error) {
      notification.error({
        message: "Server Error",
        description: "Error fetching orders.",
        placement: "bottomRight",
      });
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!currentOrder) return;
    try {
      const res = await axios.post(`${API_URL}/api/order/payment`, {
        orderId: currentOrder._id,
        payment: true,
      });

      if (res.data.success) {
        notification.success({
          message: "Payment Confirmed",
          description: "The order has been marked as paid.",
          placement: "bottomRight",
        });

        setOrders((prev) =>
          prev.map((o) =>
            o._id === currentOrder._id ? { ...o, payment: true } : o
          )
        );
      } else {
        notification.error({
          message: "Failed to Update",
          description: res.data.message || "Payment update failed.",
          placement: "bottomRight",
        });
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      notification.error({
        message: "Server Error",
        description: "Could not mark order as paid.",
        placement: "bottomRight",
      });
    } finally {
      setConfirmVisible(false);
      setCurrentOrder(null);
    }
  };

  const markAsPaid = (order) => {
    setCurrentOrder(order);
    setConfirmVisible(true);
  };

  const markAsDelivered = async (order) => {
    try {
      const res = await axios.post(`${API_URL}/api/order/status`, {
        orderId: order._id,
        status: "Delivered",
      });

      if (res.data.success) {
        playNotificationSound();
        notification.success({
          message: "Delivered",
          description: "Order marked as delivered.",
          placement: "bottomRight",
        });

        setOrders((prev) =>
          prev.map((o) =>
            o._id === order._id ? { ...o, status: "Delivered" } : o
          )
        );

        setTimeout(() => {
          setOrders((prev) => prev.filter((o) => o._id !== order._id));
        }, 180000);
      } else {
        notification.error({
          message: "Update Failed",
          description: res.data.message || "Could not update status.",
          placement: "bottomRight",
        });
      }
    } catch (error) {
      console.error("Delivery Error:", error);
      notification.error({
        message: "Server Error",
        description: "Failed to update order status.",
        placement: "bottomRight",
      });
    }
  };

  const filteredOrders = orders.filter((order) => {
    const fullName =
      `${order.address.firstName} ${order.address.lastName}`.toLowerCase();
    return (
      fullName.includes(search.toLowerCase()) ||
      order.address.phone.includes(search)
    );
  });

  const columns = [
    {
      title: "Customer",
      render: (_, order) => (
        <div>
          <strong>
            {order.address.firstName} {order.address.lastName}
          </strong>
          <div>{order.address.phone}</div>
        </div>
      ),
    },
    {
      title: "Address",
      render: (_, order) => {
        const { street, city, state, zipcode, country } = order.address;
        const mapQuery = encodeURIComponent(
          `${street}, ${city}, ${state} ${zipcode}, ${country}`
        );
        return (
          <div>
            <div>{street}</div>
            <div>
              {city}, {state} {zipcode}
            </div>
            <div>{country}</div>
            <Tooltip title="Open in Google Maps">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="view-map-link"
              >
                <EnvironmentOutlined /> View Map
              </a>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "Items",
      dataIndex: "items",
      render: (items) => (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {items.map((item, idx) => (
            <li key={idx}>
              {item.name} × {item.quantity}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "Payment",
      render: (_, order) => {
        const isPaid = order.payment === true || order.payment === "true";
        return isPaid ? (
          <Tag color="green">Paid</Tag>
        ) : (
          <Tag color="red">${order.amount.toFixed(2)} - Unpaid</Tag>
        );
      },
      align: "right",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={statusMap[status]?.color} icon={statusMap[status]?.icon}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      render: (_, order) => {
        const isPaid = order.payment === true || order.payment === "true";

        return isPaid ? (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => markAsDelivered(order)}
          >
            Mark as Delivered
          </Button>
        ) : (
          <Button danger onClick={() => markAsPaid(order)}>
            Mark as Paid
          </Button>
        );
      },
    },
  ];

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header className="delivery-header">
        <h2>Delivery Dashboard</h2>
        <Button
          danger
          icon={<LogoutOutlined />}
          onClick={() =>
            (window.location.href = "http://localhost:5173/staff/login")
          }
        >
          Logout
        </Button>
      </Header>

      <Content className="delivery-content">
        <div className="search-refresh-bar">
          <Input.Search
            allowClear
            placeholder="Search by name or phone"
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchOrders}>
            Refresh
          </Button>
        </div>

        <Spin spinning={loading} tip="Loading Orders...">
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={filteredOrders}
            pagination={{ pageSize: 10 }}
            bordered
          />
        </Spin>

        {/* Manual Modal for Payment Confirmation */}
        <Modal
          open={confirmVisible}
          title="Confirm Payment"
          onOk={handleConfirmPayment}
          onCancel={() => setConfirmVisible(false)}
          okText="Yes"
          cancelText="No"
        >
          {currentOrder && (
            <div>
              Has the customer paid{" "}
              <strong>${currentOrder.amount.toFixed(2)}</strong>?
            </div>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default DeliveryPanel;
