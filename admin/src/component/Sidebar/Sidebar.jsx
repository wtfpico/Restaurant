import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaChartBar,
  FaBox,
  FaUsers,
  FaClipboardList,
  FaEnvelope,
  FaFileAlt,
  FaBoxOpen,
  FaShoppingCart
} from "react-icons/fa";
import "./Sidebar.css"; // Import the CSS file

const Sidebar = () => {
  const [isOpen] = useState(false);

  return (
    <div className={`sidebar ${isOpen ? "" : "collapsed"}`}>
     
      <nav>
        <SidebarItem
          icon={<FaHome />}
          text="Dashboard"
          to="/"
          isOpen={isOpen}
        />
        <SidebarItem
          icon={<FaChartBar />}
          text="Analytics"
          to="/analytics"
          isOpen={isOpen}
        />
        <SidebarItem
          icon={<FaBox />}
          text="Categories"
          to="/categories"
          isOpen={isOpen}
        />
        <SidebarItem
          icon={<FaClipboardList />}
          text="Products"
          to="/products"
          isOpen={isOpen}
        />
        <SidebarItem
          icon={<FaShoppingCart />}
          text="Orders"
          to="/orders"
          isOpen={isOpen}
        />
        <SidebarItem
          icon={<FaUsers />}
          text="Staffs"
          to="/users"
          isOpen={isOpen}
        />
        <SidebarItem
          icon={<FaFileAlt />}
          text="Report"
          to="/report"
          isOpen={isOpen}
        />
      </nav>
    </div>

  );
};


// Sidebar Item Component
const SidebarItem = ({ icon, text, to }) =>
  <Link to={to} className="nav-item">
    <span className="icon">
      {icon}
    </span>
    <span className="nav-text">
      {text}
    </span>
  </Link>;

export default Sidebar;
