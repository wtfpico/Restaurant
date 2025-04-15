import categoryModel from "../models/categoryModel.js";
import fs from "fs";
import path from "path";

// ✅ Add a new category
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? req.file.filename : null;

    // Check if category already exists
    const categoryExists = await categoryModel.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const newCategory = new categoryModel({ name, image });
    await newCategory.save();

    res.json({ success: true, message: "Category added successfully", category: newCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to add category" });
  }
};

// ✅ List all categories
export const listCategory = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    res.json({ success: true, categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

// ✅ Get a single category
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch category" });
  }
};

// ✅ Update a category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const image = req.file ? req.file.filename : null;

    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // If a new image is uploaded, delete the old one
    if (image && category.image) {
      const oldImagePath = path.join("uploads", category.image);
      fs.unlink(oldImagePath, (err) => {
        if (err && err.code !== "ENOENT") console.error(err);
      });
    }

    category.name = name;
    if (image) category.image = image; // Update image if a new one is uploaded

    await category.save();
    res.json({ success: true, message: "Category updated successfully", category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update category" });
  }
};

// ✅ Delete a category
export const removeCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Delete category image if exists
    if (category.image) {
      const imagePath = path.join("uploads", category.image);
      fs.unlink(imagePath, (err) => {
        if (err && err.code !== "ENOENT") console.error(err);
      });
    }

    // Remove the category
    await categoryModel.findByIdAndDelete(id);

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete category" });
  }
};
