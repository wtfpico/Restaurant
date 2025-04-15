import express from "express";
import {
  registerStaff,
  loginStaff,
  getAllStaff
} from "../controllers/staffAuthController.js";
import { protectStaff, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Admin-only: register new staff
router.post("/register", protectStaff, adminOnly, registerStaff);

// Public login route
router.post("/login", loginStaff);

// Admin-only: get all staff list
router.get("/getStaff", protectStaff, adminOnly, getAllStaff);

export default router;
