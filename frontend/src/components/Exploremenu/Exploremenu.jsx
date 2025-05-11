import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import "./Exploremenu.css";

const API_BASE ="http://localhost:4000";

const Exploremenu = ({ category, setCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch Categories from API
  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(`${API_BASE}/api/categories/list`);
        if (!cancelled) {
          if (data.success) {
            setCategories(data.categories);
          } else {
            setError("Failed to load categories");
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Network error fetching categories");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleCategory = useCallback(
    (name) => setCategory((prev) => (prev === name ? "all" : name)),
    [setCategory]
  );

  if (loading) {
    return <div className="exploremenu__loading">Loading categories…</div>;
  }

  if (error) {
    return <div className="exploremenu__error">{error}</div>;
  }

  return (
    <section className="exploremenu" id="exploremenu">
      <h1>Explore Our Menu</h1>
      <p className="exploremenu-text">
        Choose from a diverse menu of delicious food options
      </p>
      <div className="menu-list">
        {categories.map((cat) => (
          <div
            key={cat._id}
            role="button"
            tabIndex={0}
            onClick={() => toggleCategory(cat.name)}
            onKeyPress={(e) => e.key === "Enter" && toggleCategory(cat.name)}
            className={`menu-item${category === cat.name ? " active" : ""}`}
          >
            <img
              src={`${API_BASE}/uploads/${cat.image}`}
              alt={cat.name}
              onError={(e) => {
                e.target.src = "/fallback.jpg";
              }}
            />
            <p>{cat.name}</p>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="exploremenu__empty">No categories available.</div>
        )}
      </div>
      <hr />
    </section>
  );
};

Exploremenu.propTypes = {
  category: PropTypes.string.isRequired,
  setCategory: PropTypes.func.isRequired,
};

export default Exploremenu;
