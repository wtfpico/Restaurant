import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    image: { type: String, required: false }, // Image is now optional
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
