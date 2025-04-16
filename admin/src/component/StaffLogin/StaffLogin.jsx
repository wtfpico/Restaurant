import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../../Context/AdminContext";
import "./StaffLogin.css";

const StaffLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginAdmin } = useContext(AdminContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Try admin login
      const adminRes = await axios.post(
        "http://localhost:4000/api/admin/login",
        {
          email,
          password,
        }
      );

      const { token, user, role } = adminRes.data;
      loginAdmin(token, { ...user, role });

      const roleRoutes = {
        admin: "/",
      };

      navigate(roleRoutes[role] || "/");
    } catch {
      try {
        // Try staff login
        const staffRes = await axios.post(
          "http://localhost:4000/api/staff/login",
          {
            email,
            password,
          }
        );

        const { token, staff } = staffRes.data;
        const role = staff.role; // Get the role from the user object
        loginAdmin(token, { ...staff, role });

        const roleRoutes = {
          admin: "/",
          chef: "/kitchen",
          waiter: "/orders",
          cashier: "/cashier",
          manager: "/manager",
        };

        const defaultRoute = "/unauthorized"; // Instead of home page
        // Add this before navigate
        navigate(roleRoutes[role] || defaultRoute);
      } catch (staffErr) {
        alert(
          staffErr.response?.data?.message || "Login failed. Please try again."
        );
        console.error("Staff login error:", staffErr);
      }
    }
  };

  return (
    <div className="staff-login-page">
      <form onSubmit={handleSubmit} className="staff-login-form">
        <h2>Restaurant Portal Login</h2>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default StaffLogin;
