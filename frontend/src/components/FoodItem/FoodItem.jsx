import React from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";
const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart,url } = React.useContext(
    StoreContext
  );
  return (
    <div className="FoodItem">
      <div className="food-Item-image-container">
        <img className="food-Item-image" src={url+"/images/"+image} alt={name} />
        {!cartItems[id] 
          ? <img
              className="add"
              onClick={() => addToCart(id)}
              src={assets.add_icon_white}
              alt=""
            />
          : <div className="food-Item-Counter">
              <img
                src={assets.add_icon_green}
                alt="add"
                onClick={() => addToCart(id)}
              />
              <p>
                {cartItems[id]}
              </p>
              <img
                src={assets.remove_icon_red}
                alt="remove"
                onClick={() => removeFromCart(id)}
              />
            </div>}
      </div>
      <div className="food-Item-details">
        <div className="food-Item-name-rating">
          <p>
            {name}
          </p>
          <img src={assets.rating_starts} alt="rating" />
        </div>
        <p className="food-Item-description">
          {description}
        </p>
        <p className="food-Item-price">
          ${price}
        </p>
      </div>
    </div>
  );
};

export default FoodItem;
