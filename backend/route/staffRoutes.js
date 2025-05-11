import express from "express";
import {
  registerStaff,
  loginStaff,
  getAllStaff,updateStaff,
  deleteStaff
} from "../controllers/staffAuthController.js";


const router = express.Router();

// Admin-only: register new staff
router.post("/register", registerStaff);

// Public login route
router.post("/login", loginStaff);

// Admin-only: get all staff list
router.get("/getStaff", getAllStaff);

// Admin-only: update staff details
router.put("/update/:id", updateStaff);

// Admin-only: delete staff
router.delete("/delete/:id",  deleteStaff);

export default router;
