import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./component/Navbar/Navbar";
import Sidebar from "./component/Sidebar/Sidebar";
import Dashboard from "./component/Dashboard/Dashboard";
import Analytics from "./Pages/Analytics/Analytics";
import Categories from "./Pages/Categories/Categories";
import Orders from "./Pages/Orders/Orders";
import Products from "./Pages/Products/Products";
import Users from "./Pages/Users/Users";
import StaffLogin from "./component/StaffLogin/StaffLogin";

import "./Pages/App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Layout = ({ url }) => {
  const location = useLocation();
  const hideLayout = location.pathname === "/staff/login";

  return (
    <div className="app-container">
      <ToastContainer />
      {!hideLayout && <Navbar />}
      <div className="main-layout">
        {!hideLayout && <Sidebar />}
        <div className="content">
          <Routes>
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics url={url} />} />
            <Route path="/categories" element={<Categories url={url} />} />
            <Route path="/orders" element={<Orders url={url} />} />
            <Route path="/products" element={<Products url={url} />} />
            <Route path="/users" element={<Users url={url} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const url = "http://localhost:4000";
  return (
    <Router>
      <Layout url={url} />
    </Router>
  );
};

export default App;
