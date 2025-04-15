import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import Verify from "./pages/Verify/Verify";
import MyOrders from "./pages/MyOrders/MyOrders";


const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <Router>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}{" "}
      {/* Pass setShowLogin */}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />{" "}
        {/* Ensure Navbar can toggle login */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/placeorder" element={<PlaceOrder />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/myorders" element={<MyOrders />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
