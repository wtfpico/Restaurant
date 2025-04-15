import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        {/* Left Section - Logo & Social Media */}
        <div className="footer-content-left">
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="facebook" />
            <img src={assets.twitter_icon} alt="twitter" />
            <img src={assets.linkedin_icon} alt="linkedin" />
          </div>
        </div>

        {/* Center Section - Company Links */}
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* Right Section - Contact Information */}
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+91 1234567890</li>
            <li>8H2z0@example.com</li>
          </ul>
        </div>
      </div>
      <hr/>
      <p className="footer-copyright">
        &copy; 2021 Food Delivery App. All Rights Reserved.
      </p>
    </div>
  );
};

export default Footer;
