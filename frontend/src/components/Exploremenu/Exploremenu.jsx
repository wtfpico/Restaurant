import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Exploremenu.css";

const Exploremenu = ({ category, setCategory }) => {
  const [categories, setCategories] = useState([]);
  const url = "http://localhost:4000"; // Your backend URL

  // Fetch Categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${url}/api/categories/list`);
        if (response.data.success) {
          setCategories(response.data.categories);
        } else {
          console.error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="exploremenu" id="exploremenu">
      <h1>Explore our menu</h1>
      <p className="exploremenu-text">
        Choose from a diverse menu of delicious food options
      </p>
      <div className="menu-list">
        {/* Display Categories */}
        {categories.map((item, index) => (
          <div
            key={index}
            onClick={() =>
              setCategory((prev) => (prev === item.name ? "all" : item.name))
            }
            className="menu-item"
          >
            <img
              className={category === item.name ? "active" : ""}
              src={`${url}/uploads/${item.image}`} // Assuming the image is stored in "uploads"
              alt={item.name}
            />
            <p>{item.name}</p>
          </div>
        ))}
      </div>
      <hr />
    </div>
  );
};

export default Exploremenu;
