import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <div className="footer-content">
        {/* Left Section - Logo & Social Media */}
        <div className="footer-content-left">
          <p>Delivering your favorite meals hot and fast, anytime.</p>
          <div className="footer-social-icons">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={assets.facebook_icon} alt="Facebook" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={assets.twitter_icon} alt="Twitter" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={assets.linkedin_icon} alt="LinkedIn" />
            </a>
          </div>
        </div>

        {/* Center Section - Company Links */}
        <nav className="footer-content-center" aria-label="Company Navigation">
          <h2>COMPANY</h2>
          <ul>
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#delivery">Delivery</a>
            </li>
            <li>
              <a href="#privacy">Privacy Policy</a>
            </li>
          </ul>
        </nav>

        {/* Right Section - Contact Information */}
        <address className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>
              <a href="tel:+911234567890">+91 1234567890</a>
            </li>
            <li>
              <a href="mailto:8H2z0@example.com">8H2z0@example.com</a>
            </li>
          </ul>
        </address>
      </div>
      <hr />
      <p className="footer-copyright">
        &copy; {new Date().getFullYear()} Food Delivery App. All Rights
        Reserved.
      </p>
    </footer>
  );
};

export default Footer;
