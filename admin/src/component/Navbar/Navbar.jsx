import React, { useContext, useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../../Context/AdminContext";
import { Modal, Button, message } from "antd";


const Navbar = () => {
  const navigate = useNavigate();
  const { admin } = useContext(AdminContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    message.success("Logged out successfully");
    navigate("/staff/login");
  };


  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <img src={assets.logo} alt="Logo" />
        </div>

        <div className="nav-right">
          <div className="admin-info">
            <img
              src={assets.profile_image}
              alt="Admin"
              className="admin-avatar"
            />
            <span>{admin?.role ? admin.role.toUpperCase() : "USER"}</span>
          </div>
          <button
            className="logout-btn"
            onClick={() => setShowLogoutModal(true)}
          >
            Logout
          </button>
        </div>
      </nav>

      <Modal
        title="Confirm Logout"
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>,
          <Button
            key="logout"
            type="primary"
            danger
            onClick={handleConfirmLogout}
          >
            Logout
          </Button>,
        ]}
      >
        <p>Are you sure you want to logout?</p>
      </Modal>
    </>
  );
};

export default Navbar;
