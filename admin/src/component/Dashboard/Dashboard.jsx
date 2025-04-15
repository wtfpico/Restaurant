import React from "react";
import { FaUsers, FaBox, FaChartLine, FaCog, FaBell } from "react-icons/fa";
import "./Dashboard.css";

const quickLinks = [
  {
    icon: <FaUsers />,
    title: "Manage Users",
    action: () => alert("Go to Users"),
  },
  {
    icon: <FaBox />,
    title: "Manage Products",
    action: () => alert("Go to Products"),
  },
  {
    icon: <FaChartLine />,
    title: "View Reports",
    action: () => alert("Go to Reports"),
  },
  { icon: <FaCog />, title: "Settings", action: () => alert("Go to Settings") },
];

const recentActivities = [
  "John Doe created a new product.",
  "New user signed up: janedoe@email.com",
  "Order #12345 has been delivered.",
  "Settings updated by Admin",
];

const notifications = [
  "Server backup completed successfully.",
  "New feedback received from customer.",
  "Low stock warning on Product ID: 2023-05",
];

const NewDashboard = () => {
  return (
    <div className="new-dashboard">
      <h2 className="dashboard-heading">Admin Dashboard</h2>

      {/* Quick Stats */}
      <section className="section stats-bar">
        <div className="stat-item">
          <h4>Users</h4>
          <p>102</p>
        </div>
        <div className="stat-item">
          <h4>Orders</h4>
          <p>56</p>
        </div>
        <div className="stat-item">
          <h4>Revenue</h4>
          <p>$12,340</p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-links">
          {quickLinks.map((link, index) => (
            <button key={index} className="quick-card" onClick={link.action}>
              <span className="quick-icon">{link.icon}</span>
              <span className="quick-text">{link.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="section mt-4">
        <h3 className="section-title">
          <FaBell /> Notifications
        </h3>
        <ul className="activity-list">
          {notifications.map((note, index) => (
            <li key={index} className="activity-item">
              • {note}
            </li>
          ))}
        </ul>
      </section>

      {/* Recent Activity */}
      <section className="section mt-4">
        <h3 className="section-title">Recent Activity</h3>
        <ul className="activity-list">
          {recentActivities.map((activity, index) => (
            <li key={index} className="activity-item">
              • {activity}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default NewDashboard;
