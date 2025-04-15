import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import { StoreContext } from "../../Context/StoreContext";

const Cart = () => {
  const { cartItems, food_list, removeFromCart,getTotalCartAmount,url } = useContext(StoreContext);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();

  const DELIVERY_FEE = 2; // Define a delivery fee

  // Sample promo codes
  const promoCodes = {
    SAVE10: 10, // 10% discount
    FOODIE5: 5 // 5% discount
  };

  // Calculate subtotal
  const subtotal = food_list.reduce((acc, item) => {
    return acc + (cartItems[item._id] ? item.price * cartItems[item._id] : 0);
  }, 0);

  // Apply discount if valid promo code is entered
  const handleApplyPromo = () => {
    if (promoCodes[promoCode.toUpperCase()]) {
      setDiscount(promoCodes[promoCode.toUpperCase()]);
    } else {
      setDiscount(0); // Reset if invalid code
      alert("Invalid Promo Code!");
    }
  };

  const discountAmount = subtotal * discount / 100;

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map(item => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={item._id}>
                <div className="cart-items-title cart-items-item">
                  <img src={url+"/images/"+item.image} alt={item.name} />
                  <p>
                    {item.name}
                  </p>
                  <p>
                    $ {item.price}
                  </p>
                  <p>
                    {cartItems[item._id]}
                  </p>
                  <p>
                    $ {item.price * cartItems[item._id]}
                  </p>
                  <p onClick={() => removeFromCart(item._id)} className="cross">
                    x
                  </p>
                </div>
                <hr />
              </div>
            );
          }
          return null; // Ensure no undefined returns
        })}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>
              {getTotalCartAmount()}
            </p>
          </div>
          {discount > 0 &&
            <div className="cart-total-details">
              <p>
                Discount ({discount}%)
              </p>
              <p>
                - ${discountAmount.toFixed(2)}
              </p>
            </div>}
          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>
              ${getTotalCartAmount()===0 ? 0 : DELIVERY_FEE.toFixed(2)}
            </p>
          </div>
          <div className="cart-total-details">
            <b>Total </b>
            <b>
             ${getTotalCartAmount()===0 ? 0 : getTotalCartAmount() + DELIVERY_FEE}
            </b>
          </div>
          <button onClick={() => navigate("/placeorder")}>Checkout</button>
        </div>

        {/* 🆕 Promo Code Section */}
        <div className="cart-promocode">
          <div>
            <h2>Promo Code?</h2>
            <div className="cart-promocode-input">
              <input
                type="text"
                placeholder="Enter Promo Code"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
              />
              <button onClick={handleApplyPromo}>Apply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
