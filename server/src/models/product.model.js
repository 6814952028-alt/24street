const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["t-shirts", "baggy-pants", "hoodies", "jackets", "accessories"],
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    materials: [{ type: String, trim: true }],
    care: [{ type: String, trim: true }],
    images: [{ type: String, trim: true }],
    variants: { type: [variantSchema], default: [] },
    featured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ["draft", "active", "archived"], default: "active" },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
