const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  image: String,
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const addressSchema = new mongoose.Schema({
  recipient: { type: String, required: true, trim: true }, phone: { type: String, required: true, trim: true },
  line1: { type: String, required: true, trim: true }, district: { type: String, required: true, trim: true },
  province: { type: String, required: true, trim: true }, postalCode: { type: String, required: true, trim: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  items: { type: [orderItemSchema], required: true }, shippingAddress: { type: addressSchema, required: true },
  subtotal: { type: Number, required: true }, shippingFee: { type: Number, required: true }, total: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
  fulfillmentStatus: { type: String, enum: ["new", "processing", "shipped", "delivered", "cancelled"], default: "new" },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
