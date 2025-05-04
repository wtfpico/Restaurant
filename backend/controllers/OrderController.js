import orderModel from "../models/OrderModel.js";
import UserModel from "../models/UserModel.js";
import Stripe from "stripe";
import { io } from "../server.js";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Placing an order
const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5174";
  try {
  const newOrder = new orderModel({
     userId:req.body.userId,
      items:req.body.items,
       amount:req.body.amount,
        address:req.body.address, });
    await newOrder.save();
    await UserModel.findByIdAndUpdate(req.body.userId, {cartData:{}});

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Delivery Charges" },
        unit_amount: 2 * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items:line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log("Error placing order:", error);
    res.json({ success: false, message: "Error placing order" });
  }
};

// Verify order
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });

      // Emit a live analytics update to all connected clients
      io.emit("newOrder", { orderId });

      res.json({ success: true, message: "Order verified successfully" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Order verification failed" });
    }
  } catch (error) {
    console.error("Error verifying order:", error);
    res.json({
      success: false,
      message: "Error verifying order",
      error: error.message,
    });
  }
};


// User orders
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// List all orders
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// Update order status
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res
      .status(200)
      .json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ success: false, message: "Error updating status" });
  }
};

// controllers/orderController.js
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, payment } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required.",
      });
    }

    if (typeof payment !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid payment value. Must be true or false.",
      });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { payment },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
    });
  }
};


export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus , updatePaymentStatus };
