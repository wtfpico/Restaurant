import React, { createContext, useState, useEffect } from "react";

export const AdminContext = createContext();

const AdminProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(localStorage.getItem("adminToken") || "");
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setAdminToken(token);
    }
  }, []);

  const loginAdmin = (token, info) => {
    localStorage.setItem("adminToken", token);
    setAdminToken(token);
    setAdminInfo(info);
  };

  const logoutAdmin = () => {
    setAdminToken("");
    setAdminInfo(null);
    localStorage.removeItem("adminToken");
  };

  return (
    <AdminContext.Provider
      value={{ adminToken, adminInfo, loginAdmin, logoutAdmin }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;
