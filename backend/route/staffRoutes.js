import express from "express";
import {
  registerStaff,
  loginStaff,
  getAllStaff,updateStaff,
  deleteStaff
} from "../controllers/staffAuthController.js";
import { protectStaff, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Admin-only: register new staff
router.post("/register", protectStaff, adminOnly, registerStaff);

// Public login route
router.post("/login", loginStaff);

// Admin-only: get all staff list
router.get("/getStaff", protectStaff, adminOnly, getAllStaff);

// Admin-only: update staff details
router.put("/update/:id", protectStaff, adminOnly, updateStaff);

// Admin-only: delete staff
router.delete("/delete/:id", protectStaff, adminOnly, deleteStaff);

export default router;
