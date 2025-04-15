import UserModel from "../models/UserModel.js";

const addToCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    if (!userId || !itemId) {
      return res.json({ success: false, message: "Invalid request data" });
    }

    let userData = await UserModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};

    if (!cartData[itemId]) {
      cartData[itemId] = 1;
    } else {
      cartData[itemId] += 1;
    }

    await UserModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Added to cart" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error adding to cart" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    if (!userId || !itemId) {
      return res.json({ success: false, message: "Invalid request data" });
    }

    let userData = await UserModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};

    if (cartData[itemId] && cartData[itemId] > 0) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId]; // Remove item if quantity is 0
      }
    }

    await UserModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Removed from cart" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error removing from cart" });
  }
};

const getCart = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "Invalid request data" });
    }

    let userData = await UserModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};
    res.json({ success: true, cartData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching cart" });
  }
};

export { addToCart, removeFromCart, getCart };
