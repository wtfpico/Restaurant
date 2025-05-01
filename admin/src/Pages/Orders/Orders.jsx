import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Tag, Select, Button, Modal, Badge, Spin, message } from "antd";
import {
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "./Orders.css";

const { Option } = Select;


const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
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
      title: "Customer",
      key: "customer",
      render: (_, order) => (
        <div className="customer-info">
          <p className="customer-name">
            {order.address.firstName} {order.address.lastName}
          </p>
          <p className="customer-phone">{order.address.phone}</p>
        </div>
      ),
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
      title: "Address",
      key: "address",
      render: (_, order) => (
        <div className="order-address">
          <p>{order.address.street}</p>
          <p>
            {order.address.city}, {order.address.state} {order.address.zipcode}
          </p>
          <p>{order.address.country}</p>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `$${amount.toFixed(2)}`,
      align: "right",
      width: 100,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date) => moment(date).format("MMM D, h:mm A"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      width: 150,
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
      filters: [
        { text: "Food Processing", value: "Food Processing" },
        { text: "Out for Delivery", value: "Out for Delivery" },
        { text: "Delivered", value: "Delivered" },
        { text: "Completed", value: "Completed" },
        { text: "Cancelled", value: "Cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
      width: 180,
    },
   
  ];

 const fetchAllOrders = async (params = {}) => {
   setLoading(true);
   try {
     const currentPage = params.page || pagination.current;
     const limit = params.limit || pagination.pageSize;

     const response = await axios.get(`${url}/api/order/list`, {
       params: {
         page: currentPage,
         limit: limit,
         status: selectedStatus !== "all" ? selectedStatus : undefined,
       },
     });

     if (response.data.success) {
       setOrders(response.data.data);
       setPagination((prev) => ({
         ...prev,
         total: response.data.total || 0,
         current: currentPage,
         pageSize: limit,
       }));
     } else {
       message.error(response.data.message || "Failed to fetch orders");
     }
   } catch (error) {
     message.error("Error fetching orders. Please try again.");
     console.error("Error:", error);
   } finally {
     setLoading(false);
   }
 };


  
  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));

    fetchAllOrders({
      page: newPagination.current,
      limit: newPagination.pageSize,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
    });
  };


  const refreshOrders = () => {
    fetchAllOrders();
  };

  useEffect(() => {
    fetchAllOrders();
  }, [selectedStatus]);

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>
          <ShoppingCartOutlined /> Order Management
        </h2>
        <div className="controls">
          <Select
            defaultValue="all"
            style={{ width: 200 }}
            onChange={(value) => setSelectedStatus(value)}
          >
            <Option value="all">All Orders</Option>
            <Option value="Food Processing">Food Processing</Option>
            <Option value="Out for Delivery">Out for Delivery</Option>
            <Option value="Delivered">Delivered</Option>
            <Option value="Completed">Completed</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>
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
  );
};

export default Orders;
