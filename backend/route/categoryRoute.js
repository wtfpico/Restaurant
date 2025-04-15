import express from "express";
import upload from "../middleware/upload.js";
import {
  addCategory,
  listCategory,
  getCategory,
  updateCategory,
  removeCategory
} from "../controllers/categoryController.js";

const categoryRouter = express.Router();

categoryRouter.post("/add", upload.single("image"), addCategory);
categoryRouter.get("/list", listCategory);
categoryRouter.get("/:id", getCategory);
categoryRouter.put("/update/:id", upload.single("image"), updateCategory);
categoryRouter.delete("/remove/:id", removeCategory);

export default categoryRouter;
