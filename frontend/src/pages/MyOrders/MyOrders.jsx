import React, { useState, useContext, useEffect } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/assets";
import { Modal, message, Button } from "antd";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(url + "/api/order/userorders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const handleConfirmClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowModal(true);
  };

  const handleConfirmOrder = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/status",
        { orderId: selectedOrderId, status: "Completed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        message.success("Order marked as completed");
        fetchOrders(); // Refresh the order list
      } else {
        message.error(response.data.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      message.error("An error occurred");
    } finally {
      setShowModal(false);
      setSelectedOrderId(null);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {data.map((order, index) => (
          <div className="my-orders-order" key={index}>
            <img src={assets.parcel_icon} alt="" />
            <p>
              {order.items.map((item, i) =>
                i === order.items.length - 1
                  ? `${item.name} x ${item.quantity}`
                  : `${item.name} x ${item.quantity}, `
              )}
            </p>
            <p>${order.amount}.00</p>
            <p>Items: {order.items.length}</p>
            <p>
              <span> &#x25cf;</span> <b>{order.status}</b>
            </p>

            {order.status === "Completed" ? (
              <button disabled>Order Completed</button>
            ) : order.status === "Delivered" && order.payment === true ? (
              <button onClick={() => handleConfirmClick(order._id)}>
                Confirm Order
              </button>
            ) : (
              <button onClick={fetchOrders}>Track Order</button>
            )}
          </div>
        ))}
      </div>

      <Modal
        open={showModal}
        title="Confirm Order Received"
        onOk={handleConfirmOrder}
        onCancel={() => setShowModal(false)}
        okText="Yes, Confirm"
        cancelText="Cancel"
      >
        <p>Are you sure you have received this order?</p>
      </Modal>
    </div>
  );
};

export default MyOrders;
