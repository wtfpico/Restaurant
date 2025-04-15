import express from "express";
import {
  addFood,
  listFood,
  removeFood,
  updateFood,
  getFood,
} from "../controllers/foodController.js";
import multer from "multer";

const foodRouter = express.Router(); // ✅ Correctly initialized `foodRouter`

// Image Storage Engine
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // ✅ Fixed filename callback
  },
});

const upload = multer({ storage: storage });

// Routes
foodRouter.post("/add", upload.single("image"), addFood); // ✅ Changed `router` to `foodRouter`
foodRouter.get("/list", listFood);
foodRouter.get("/:id", getFood);
foodRouter.put("/update/:id", upload.single("image"), updateFood);
foodRouter.delete("/remove/:id", removeFood);

export default foodRouter;
