import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    colorName: { type: String, required: true, trim: true },
    colorHex: { type: String, default: "" },
    sku: { type: String, default: "", trim: true },
    stock: { type: Number, default: 0, min: 0 },
    price: { type: Number, min: 0 },
    imageUrl: { type: String, default: "" },
    images: [{ type: String }],
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: false }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    desc: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },

    imageUrl: { type: String, default: "" },
    gallery: [{ type: String }],

    category: { type: String, default: "aksesuar" },
    brand: { type: String, default: "" },
    stock: { type: Number, default: 0, min: 0 },

    variants: { type: [variantSchema], default: [] },

    likeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);