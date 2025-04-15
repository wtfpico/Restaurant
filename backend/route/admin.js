import express from "express";
import jwt from "jsonwebtoken";

const Router = express.Router();

// Hardcoded default admin
const defaultAdmin = {
  _id: "admin-001", // Add an id field to match staff structure
  name: "Super Admin",
  email: "admin@rms.com",
  password: "admin123",
  role: "admin",
};

// POST /api/admin/login
Router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === defaultAdmin.email && password === defaultAdmin.password) {
    // 👇 Matching the structure used for staff tokens
    const token = jwt.sign(
      {
        _id: defaultAdmin._id,
        name: defaultAdmin.name,
        email: defaultAdmin.email,
        role: defaultAdmin.role,
      },
      process.env.JWT_SECRET || "yourSecretKey",
      { expiresIn: "2h" }
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
