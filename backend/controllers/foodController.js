import foodModel from "../models/foodModel.js";
import fs from "fs";
import path from "path";

// Add Food
const addFood = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const image_filename = req.file ? req.file.filename : "";

    // Check if food with the same name exists
    const existingFood = await foodModel.findOne({ name });
    if (existingFood) {
      return res
        .status(400)
        .json({ success: false, message: "Food already exists" });
    }

    const food = new foodModel({
      name,
      description,
      price,
      category,
      image: image_filename,
    });

    await food.save();
    res.json({ success: true, message: "Food added successfully", food });
  } catch (error) {
    console.error("Error adding food:", error);
    res.status(500).json({ success: false, message: "Error adding food" });
  }
};

// List All Food Items
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({}).populate("category", "name");
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error("Error fetching foods:", error);
    res.status(500).json({ success: false, message: "Error fetching foods" });
  }
};

// Remove Food
const removeFood = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await foodModel.findByIdAndDelete(id);

    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food not found" });
    }

    if (food.image) {
      const imagePath = path.resolve("uploads", food.image);
      fs.unlink(imagePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Error deleting image:", err);
        }
      });
    }

    res.json({ success: true, message: "Food deleted successfully" });
  } catch (error) {
    console.error("Error deleting food:", error);
    res.status(500).json({ success: false, message: "Error deleting food" });
  }
};

// Update Food
const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category } = req.body;
    const newImage = req.file ? req.file.filename : null;

    const food = await foodModel.findById(id);
    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food not found" });
    }

    if (newImage && food.image) {
      const oldImagePath = path.resolve("uploads", food.image);
      fs.unlink(oldImagePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Error deleting old image:", err);
        }
      });
    }

    const updatedFood = await foodModel.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        category,
        ...(newImage && { image: newImage }),
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Food updated successfully",
      food: updatedFood,
    });
  } catch (error) {
    console.error("Error updating food:", error);
    res.status(500).json({ success: false, message: "Failed to update food" });
  }
};

// Get Single Food Item
const getFood = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await foodModel.findById(id).populate("category", "name");
    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food not found" });
    }
    res.json({ success: true, food });
  } catch (error) {
    console.error("Error fetching food:", error);
    res.status(500).json({ success: false, message: "Failed to fetch food" });
  }
};

export { addFood, listFood, removeFood, updateFood, getFood };
