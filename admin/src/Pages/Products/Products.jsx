import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Products.css";
import { assets } from "../../assets/assets";
import { ToastContainer, toast } from "react-toastify";

const Products = () => {
  const url = "http://localhost:4000"; // Base URL for API requests
  const [categories, setCategories] = useState([]); // Categories
  const [foodList, setFoodList] = useState([]); // Food List
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // For image preview
  const [editingId, setEditingId] = useState(null); // Track editing food ID

  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${url}/api/categories/list`);
        if (response.data.success) {
          setCategories(response.data.categories);
        } else {
          toast.error("Failed to fetch categories");
        }
      } catch (error) {
        toast.error(`Error fetching categories: ${error.message}`);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products
  const fetchFood = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setFoodList(response.data.data);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      toast.error(`Error fetching products: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchFood();
  }, []);

  // Add or Update Food Item
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    if (image) formData.append("image", image);

    try {
      if (editingId) {
        // Update existing food item
        const response = await axios.put(
          `${url}/api/food/update/${editingId}`,
          formData
        );
        if (response.data.success) {
          toast.success("Product updated successfully");
        } else {
          toast.error("Failed to update product");
        }
      } else {
        // Add new food item
        const response = await axios.post(`${url}/api/food/add`, formData);
        if (response.data.success) {
          toast.success("Product added successfully");
        } else {
          toast.error("Failed to add product");
        }
      }
      resetForm();
      fetchFood(); // Refresh list
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  // Delete Food Item
  const deleteFood = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const response = await axios.delete(`${url}/api/food/remove/${id}`);
      if (response.data.success) {
        toast.success("Food deleted successfully");
        fetchFood(); // Refresh list
      } else {
        toast.error("Failed to delete food");
      }
    } catch (error) {
      toast.error(`Error deleting food: ${error.message}`);
    }
  };

  // Handle Edit - Prefill Form
  const editFood = (food) => {
    setEditingId(food._id);
    setData({
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category?._id || food.category, // Ensure category is set correctly
    });
    setPreviewImage(`${url}/uploads/${food.image}`);
    setImage(null);
  };

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setData({
      name: "",
      description: "",
      price: "",
      category: "",
    });
    setImage(null);
    setPreviewImage(null);
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="products-container">
      <ToastContainer />
      <div className="add">
        <form className="flex-col" onSubmit={onSubmitHandler}>
          <div className="add-img-upload flex-col">
            <p>Upload Image</p>
            <label htmlFor="image">
              <img src={previewImage || assets.upload_area} alt="upload" />
            </label>
            <input onChange={onImageChange} type="file" id="image" hidden />
          </div>
          <div className="add-product-name flex-col">
            <p>Product Name</p>
            <input
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              placeholder="Product Name"
              name="name"
              required
            />
          </div>
          <div className="add-product-description flex-col">
            <p>Product Description</p>
            <textarea
              onChange={onChangeHandler}
              value={data.description}
              name="description"
              rows="6"
              placeholder="Product Description"
              required
            ></textarea>
          </div>
          <div className="add-category-price">
            <div className="add-category flex-col">
              <p>Category</p>
              <select
                onChange={onChangeHandler}
                value={data.category}
                name="category"
                required
              >
                <option value="" disabled>
                  Select a Category
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="add-price flex-col">
              <p>Price</p>
              <input
                onChange={onChangeHandler}
                value={data.price}
                type="number"
                name="price"
                placeholder="Price"
                required
              />
            </div>
          </div>
          <button type="submit" className="add-product-btn">
            {editingId ? "UPDATE" : "ADD"}
          </button>
          {editingId && (
            <button type="button" className="cancel-btn" onClick={resetForm}>
              CANCEL
            </button>
          )}
        </form>
      </div>

      {/* Food List Table */}
      <table className="product-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {foodList.length > 0 ? (
            foodList.map((food) => (
              <tr key={food._id}>
                <td>
                  <img
                    src={`${url}/uploads/${food.image}`}
                    alt={food.name}
                    width="50"
                    height="50"
                  />
                </td>
                <td>{food.name}</td>
                <td>{food.description}</td>
                <td>
                  {food.category?.name ||
                    categories.find((c) => c._id === food.category)?.name ||
                    "Unknown Category"}
                </td>
                <td>${food.price}</td>
                <td>
                  <button className="edit-btn" onClick={() => editFood(food)}>
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteFood(food._id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No products available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
