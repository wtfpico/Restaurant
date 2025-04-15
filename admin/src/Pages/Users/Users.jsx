import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./Users.css";
import { FaUserPlus } from "react-icons/fa";

import { AdminContext } from "../../Context/AdminContext"; // Adjust the path as needed

const Users = () => {
  const { adminToken } = useContext(AdminContext); // Move useContext to the top level
  const [staffs, setStaffs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "waiter",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  

  const fetchStaffs = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/staffs", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      setStaffs(response.data.staffs);
    } catch (error) {
      handleTokenError(error);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const handleTokenError = (error) => {
    const message =
      error.response?.data?.message || "Authentication error. Please log in.";
    console.error("Token error:", message);

    if (
      message.toLowerCase().includes("jwt expired") ||
      message.toLowerCase().includes("invalid token") ||
      error.response?.status === 401
    ) {
      localStorage.removeItem("adminToken");
      alert("Session expired. Please log in again.");
      window.location.reload();
    } else {
      setError(message);
    }
  };

  const handleToggleForm = () => {
    setShowForm(!showForm);
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const escapeHtml = (unsafe) => {
    return unsafe.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");
// Removed as adminToken is now accessed at the component level

try {
  const response = await axios.post(
    "http://localhost:4000/api/staffs",
    formData,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    }
  );

  if (response.data.success) {
        await fetchStaffs(); // Refetch full list
        setShowForm(false);
        setFormData({ name: "", email: "", password: "", role: "waiter" });
        setSuccessMessage("✅ Staff registered successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (error) {
      handleTokenError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="users">
      <div className="users-header">
        <h2>Staff List</h2>
        <button className="add-btn" onClick={handleToggleForm}>
          <FaUserPlus /> Add Staff
        </button>
      </div>

      {/* Modal Popup */}
      {showForm && (
        <div className="modal-overlay" onClick={handleToggleForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Staff</h3>
            <form className="staff-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="admin">Admin</option>
                <option value="chef">Chef</option>
                <option value="waiter">Waiter</option>
                <option value="cashier">Cashier</option>
              </select>

              {error && <p className="error-message">{error}</p>}

              <div className="form-buttons">
                <button type="button" onClick={handleToggleForm}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Registering..." : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {successMessage && <p className="success-message">{successMessage}</p>}

      {Array.isArray(staffs) && staffs.length > 0 ? (
        <ul className="staff-list">
          {[...staffs]
            .sort((a, b) => a.role.localeCompare(b.role))
            .map((staff) => (
              <li key={staff._id}>
                {escapeHtml(staff.name)} - {escapeHtml(staff.email)} -{" "}
                {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
              </li>
            ))}
        </ul>
      ) : (
        <p>No staff found.</p>
      )}
    </div>
  );
};

export default Users;
