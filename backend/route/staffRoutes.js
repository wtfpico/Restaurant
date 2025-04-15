import express from "express";
import {
  registerStaff,
  loginStaff,
} from "../controllers/staffAuthController.js";
import { protectStaff, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", protectStaff, adminOnly, registerStaff);
router.post("/login", loginStaff);

export default router;
