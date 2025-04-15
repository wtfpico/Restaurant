import jwt from "jsonwebtoken";
import staff from "../models/StaffModel.js";

// General-purpose middleware (optional usage)
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized, please log in" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

// Protect staff routes
export const protectStaff = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔐 Incoming Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing or malformed",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token || token === "undefined" || token === "null") {
    return res.status(401).json({
      success: false,
      message: "Token is missing or invalid",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.staff = decoded;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);

    // Optional: Expired token error handling
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired, please log in again",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Invalid token, please log in again",
    });
  }
};

// Admin-only middleware
export const adminOnly = (req, res, next) => {
  if (req.staff?.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied: Admins only",
    });
  }
};

export default authMiddleware;
