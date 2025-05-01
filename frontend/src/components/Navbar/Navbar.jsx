import React, { useContext, useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("menu");
   const {getTotalCartAmount,token,setToken}=useContext(StoreContext);
   const navigate = useNavigate()
   const logout = ()=>{
    localStorage.removeItem("token");
    setToken("");
    navigate("/")

   }


  // Smooth scroll for section links
  const handleScroll = (e, sectionId) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setMenu(sectionId);
    }
  };

  return (
    <div className="navbar">
      <a href="http://localhost:5173/staff/login" className="navbar-logo">
        <img src={assets.logo} alt="logo" />
      </a>

      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("home")}
          className={menu === "home" ? "active" : ""}
        >
          Home
        </Link>
        <a
          href="#exploremenu"
          onClick={(e) => handleScroll(e, "exploremenu")}
          className={menu === "exploremenu" ? "active" : ""}
        >
          Menu
        </a>
        <a
          href="#app-download"
          onClick={(e) => handleScroll(e, "app-download")}
          className={menu === "app-download" ? "active" : ""}
        >
          Mobile
        </a>
        <a
          href="#footer"
          onClick={(e) => handleScroll(e, "footer")}
          className={menu === "footer" ? "active" : ""}
        >
          Contact
        </a>
      </ul>

      <div className="navbar-right">
        <img src={assets.search_icon} alt="search" />

        <div className="navbar-search-icon">
          <Link to="/cart">
            {" "}
            <img src={assets.basket_icon} alt="cart" />
          </Link>
          
          <div className={getTotalCartAmount() === 0 ? "" : "dot"} />
        </div>
        {!token ? (
          <button onClick={() => setShowLogin(true)} className="navbar-button">
            Sign in
          </button>
        ) : (
          <div className="navbar-profile">
            <img src={assets.profile_icon} alt="" />
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate("/myorders")}>
                <img src={assets.bag_icon} alt="" /> <p>Orders</p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="Logout" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
