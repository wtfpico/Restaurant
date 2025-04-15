import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);
  const [discount] = useState(0);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    let orderItems = food_list
      .filter((item) => cartItems[item._id] > 0)
      .map((item) => ({
        ...item,
        quantity: cartItems[item._id],
      }));

    let orderData = {
      address: data,
      items: orderItems,
      amount: subtotal + DELIVERY_FEE, // Use subtotal instead of calling function again
    };

    try {
      let response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const {session_url}=response.data;
        window.location.replace(session_url);
      } else {
        alert("Error placing order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order");
    }
  };

  const DELIVERY_FEE = 2;
  const subtotal = getTotalCartAmount();
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount + DELIVERY_FEE;

  const navigate =useNavigate();
  useEffect(() => {
    if(!token){
      navigate('/cart')
    }
    else if (getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  },[token])

  return (
    <form onSubmit={placeOrder} className="placeorder">
      <div className="placeorder-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input required name="firstName" onChange={onChangeHandler} value={data.firstName} type="text" placeholder="First Name" />
          <input required name="lastName" onChange={onChangeHandler} value={data.lastName} type="text" placeholder="Last Name" />
        </div>
        <input required name="email" onChange={onChangeHandler} value={data.email} type="email" placeholder="Email Address" />
        <input required name="street" onChange={onChangeHandler} value={data.street} type="text" placeholder="Street" />
        <div className="multi-fields">
          <input required name="city" onChange={onChangeHandler} value={data.city} type="text" placeholder="City" />
          <input required name="state" onChange={onChangeHandler} value={data.state} type="text" placeholder="State" />
        </div>
        <div className="multi-fields">
          <input required name="zipcode" onChange={onChangeHandler} value={data.zipcode} type="text" placeholder="Zip Code" />
          <input required name="country" onChange={onChangeHandler} value={data.country} type="text" placeholder="Country" />
        </div>
        <input name="phone" onChange={onChangeHandler} value={data.phone} type="text" placeholder="Phone Number" />
      </div>

      <div className="placeorder-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div className="cart-total-row">
            <div className="cart-total-details">
              <p>
                Subtotal <span>${subtotal.toFixed(2)}</span>
              </p>
            </div>
            <div className="cart-total-details">
              <p>
                Delivery <span>${subtotal === 0 ? 0 : DELIVERY_FEE.toFixed(2)}</span>
              </p>
            </div>
            <div className="cart-total-details-total">
              <b>
                Total <span>${subtotal === 0 ? 0 : total.toFixed(2)}</span>
              </b>
            </div>
          </div>
          <button type="submit">Proceed to Payment</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
