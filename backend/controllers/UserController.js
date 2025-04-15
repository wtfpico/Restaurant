import UserModel from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// ✅ Move createToken to be accessible by both functions
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// 🔹 Login User Function (To Be Implemented)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect password" });
    }

    const token = createToken(user._id);
    res.json({ success: true, token, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// ✅ Register User Function
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    const exists = await UserModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    if (password.length < 6) {
      return res.json({ success: false, message: "Enter a strong password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    res.json({ success: true, token, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error registering user" });
  }
};

export { loginUser, registerUser };
