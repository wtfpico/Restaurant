import express from "express";
import {
  addToCart,
  removeFromCart,
  getCart,
} from "../controllers/CartController.js";
import authMiddleware from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.post("/remove", authMiddleware, removeFromCart);
cartRouter.get("/get", authMiddleware, getCart); // Corrected GET route

export default cartRouter;
