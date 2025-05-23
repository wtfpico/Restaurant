import StaffModel from "../models/StaffModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// Generate JWT Token
const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register Staff
const registerStaff = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existing = await StaffModel.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "Staff already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    if (password.length < 6) {
      return res.json({ success: false, message: "Password must be 6+ characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStaff = new StaffModel({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const staff = await newStaff.save();
    const token = createToken(staff._id, staff.role);

    res.json({ success: true, token, staff });
  } catch (error) {
    console.log("Register Staff Error:", error);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

// Login Staff
const loginStaff = async (req, res) => {
  const { email, password } = req.body;

  try {
    const staff = await StaffModel.findOne({ email });
    if (!staff) {
      return res.json({ success: false, message: "Staff not found" });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect password" });
    }

    const token = createToken(staff._id, staff.role);

    res.json({ success: true, token, staff });
  } catch (error) {
    console.log("Login Staff Error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// Get All Staffs (admin protected route)
const getAllStaff = async (req, res) => {
  try {
    const staffs = await StaffModel.find().select("-password"); // exclude passwords
    res.json({ success: true, staffs });
  } catch (error) {
    console.log("Get Staff Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch staff list" });
  }
};
// Edit Staff
const updateStaff = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  try {
    const staff = await StaffModel.findById(id);
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    if (email && !validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }

    staff.name = name || staff.name;
    staff.email = email || staff.email;
    staff.role = role || staff.role;

    await staff.save();

    res.json({ success: true, message: "Staff updated successfully", staff });
  } catch (error) {
    console.error("Update Staff Error:", error);
    res.status(500).json({ success: false, message: "Failed to update staff" });
  }
};

// Delete Staff
const deleteStaff = async (req, res) => {
  const { id } = req.params;

  try {
    const staff = await StaffModel.findByIdAndDelete(id);
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    res.json({ success: true, message: "Staff deleted successfully" });
  } catch (error) {
    console.error("Delete Staff Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete staff" });
  }
};


export { registerStaff, loginStaff , getAllStaff , updateStaff, deleteStaff };
