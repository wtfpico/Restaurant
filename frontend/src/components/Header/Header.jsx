import React from "react";
import "./Header.css";

const Header = () => {
  const scrollToMenu = () => {
    const menuSection = document.getElementById("exploremenu");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="header" aria-label="Welcome Section">
      <div className="header-contents">
        <h1>Place your orders here</h1>
        <p>Choose from a diverse menu of delicious food options</p>
        <button onClick={scrollToMenu}>View Menu</button>
      </div>
    </header>
  );
};

export default Header;
