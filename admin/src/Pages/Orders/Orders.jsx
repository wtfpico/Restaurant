import React, { useState, useEffect } from 'react'
import './Orders.css'
import axios from 'axios';
import { toast } from "react-toastify";
import { assets } from '../../assets/assets';
const Orders = ({url}) => {
 
  const [orders,setOrders]=useState([]);


  const fetchAllOrders = async()=>{
    const response = await axios.get(url+"/api/order/list");
    if(response.data.success){
      setOrders(response.data.data);
      console.log(response.data.data);
    }
    else{
      toast.error("Failed to fetch orders");
    }
  };

  const statusHandler = async(orderId,event)=>{
    const response =await axios.post(url+"/api/order/status", {orderId,status:event.target.value});
    if(response.data.success){
     await fetchAllOrders();
    }
    else{
      toast.error("Failed to update status");
    }

  }

  useEffect(()=>{
    fetchAllOrders();
  },[])

  return (
    <div className="orders-add">
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.map((order, index) => (
          <div key={index} className="order-item">
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className="order-item-food">
                {order.items.map((item, index) =>
                  index === order.items.length - 1
                    ? `${item.name} x ${item.quantity}`
                    : `${item.name} x ${item.quantity},`
                )}
              </p>
              <p className="order-item-name">
                {order.address.firstName} {order.address.lastName}
              </p>
              <div className="order-item-address">
                <p>{order.address.street},</p>
                <p>
                  {order.address.city}, {order.address.state},{" "}
                  {order.address.country}, {order.address.zipcode}
                </p>
              </div>
              <p className="order-item-phone">{order.address.phone}</p>
            </div>
            <p>Items: {order.items.length}</p>
            <p>${order.amount}</p>
            <select
              value={order.status || "Food Processing"} // Ensure order.status is used
              onChange={(event) => statusHandler(order._id, event)}
            >
              <option value="Food Processing">Food Processing</option>
              <option value="Completed">Completed</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders