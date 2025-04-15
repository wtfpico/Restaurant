import express from "express";
import jwt from "jsonwebtoken";

const Router = express.Router();

// Hardcoded default admin
const defaultAdmin = {
  email: "admin@rms.com",
  password: "admin123", // For production, hash this!
  role: "admin",
};

// POST /api/admin/login
Router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === defaultAdmin.email && password === defaultAdmin.password) {
    const token = jwt.sign(
      { email, role: defaultAdmin.role },
      "yourSecretKey",
      {
        expiresIn: "2h",
      }
    );

    return res.json({
      success: true,
      message: "Admin logged in successfully",
      token,
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }
});

export default Router;
