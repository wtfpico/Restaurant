import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Categories.css";
import { ToastContainer, toast } from "react-toastify";

const API_URL = "http://localhost:4000/api/categories"; // Change this if backend URL is different
const IMAGE_BASE_URL = "http://localhost:4000/uploads"; // Base URL for images

const Categories = () => {
  const [categoryName, setCategoryName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);

  // Fetch Categories from Backend
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/list`);
      setCategories(res.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Handle Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle Form Submit (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName) {
      toast.error("Please provide a category name.");
      return;
    }

    const formData = new FormData();
    formData.append("name", categoryName);
    if (image) formData.append("image", image);

    try {
      if (editId) {
        // Update Category
        await axios.put(`${API_URL}/update/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category updated successfully");
      } else {
        // Add New Category
        await axios.post(`${API_URL}/add`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category added successfully");
      }

      fetchCategories();
      clearForm();
    } catch (error) {
      console.error("Error adding/updating category:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // Handle Edit
  const handleEdit = (category) => {
    setCategoryName(category.name);
    setImage(null); // Reset image so user can choose a new one
    setImagePreview(`${IMAGE_BASE_URL}/${category.image}`); // Full path to display existing image
    setEditId(category._id);
  };

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/remove/${id}`);
      fetchCategories();
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  // Clear Form
  const clearForm = () => {
    setCategoryName("");
    setImage(null);
    setImagePreview(null);
    setEditId(null);
  };

  return (
    <div className="category-container">
      <div className="category-form">
        <h2>{editId ? "Edit" : "Add"} Category</h2>
        <form onSubmit={handleSubmit}>
          <label>Category Name</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter Category Name"
            required
          />

          <label>Category Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="preview-image" />
          )}

          <div className="button-group">
            <button type="submit">{editId ? "Update" : "Add"}</button>
            <button type="button" onClick={clearForm}>
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="category-list">
        <h2>Category List</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id}>
                <td>{category.name}</td>
                <td>
                  {category.image && (
                    <img
                      src={`${IMAGE_BASE_URL}/${category.image}`}
                      alt={category.name}
                      className="list-image"
                    />
                  )}
                </td>
                <td>
                  <button onClick={() => handleEdit(category)}>Edit</button>
                  <button onClick={() => handleDelete(category._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Categories;
