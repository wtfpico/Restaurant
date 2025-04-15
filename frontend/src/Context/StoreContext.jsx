import axios from "axios";
import React, { useState, createContext, useEffect } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const url = "http://localhost:4000";
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [food_list, setFoodList] = useState([]);

  // Convert food_list to a lookup object for faster access
  const foodLookup = food_list.reduce((acc, item) => {
    acc[item._id] = item;
    return acc;
  }, {});

  // Function to add an item to the cart
  const addToCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    if (token) {
      await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
  };

  // Function to remove an item from the cart
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      if (!prev[itemId]) return prev;

      const updatedCart = { ...prev };
      updatedCart[itemId]--;

      if (updatedCart[itemId] <= 0) delete updatedCart[itemId];
      return updatedCart;
    });

    if (token) {
      await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
  };

  // Function to calculate total cart amount efficiently
  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
      const itemInfo = foodLookup[itemId]; // Get item details from lookup
      return total + (itemInfo ? itemInfo.price * quantity : 0);
    }, 0);
  };

  const fetchFoodList = async () => {
    const response = await axios.get(url + "/api/food/list");
    setFoodList(response.data.data);
  };

  const loadCartData = React.useCallback(async () => {
    if (!token) return;
    const response = await axios.get(url + "/api/cart/get", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCartItems(response.data.cartData || {});
  }, [token, url]);

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      if (token) {
        await loadCartData();
      }
    }
    loadData();
  }, [token, loadCartData]); // Depend on token and loadCartData to refetch when they change

  const contextValue = {
    food_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
