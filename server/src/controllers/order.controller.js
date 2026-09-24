const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const { totalsFor, createOrderNumber } = require("../services/checkout.service");

const checkout = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart?.items.length) return res.status(400).json({ message: "Your bag is empty" });
    const required = ["recipient", "phone", "line1", "district", "province", "postalCode"];
    if (required.some(key => !req.body.shippingAddress?.[key])) return res.status(400).json({ message: "Please complete your delivery address" });
    const products = await Product.find({ _id: { $in: cart.items.map(item => item.productId) }, status: "active" });
    const items = cart.items.map(item => {
      const product = products.find(p => p._id.equals(item.productId)); const variant = product?.variants.find(v => v.sku === item.sku);
      if (!product || !variant || variant.stock < item.quantity) { const error = new Error("One or more items are no longer available"); error.statusCode = 409; throw error; }
      return { productId: product._id, name: product.name, sku: variant.sku, size: variant.size, color: variant.color, image: product.images[0], unitPrice: product.price, quantity: item.quantity };
    });
    for (const item of items) await Product.updateOne({ _id: item.productId, variants: { $elemMatch: { sku: item.sku, stock: { $gte: item.quantity } } } }, { $inc: { "variants.$.stock": -item.quantity } });
    const order = await Order.create({ orderNumber: createOrderNumber(), userId: req.user._id, items, shippingAddress: req.body.shippingAddress, ...totalsFor(items) });
    cart.items = []; await cart.save(); res.status(201).json({ order });
  } catch (e) { next(e); }
};
const getMyOrders = async (req, res, next) => { try { res.json(await Order.find({ userId: req.user._id }).sort({ createdAt: -1 })); } catch (e) { next(e); } };
module.exports = { checkout, getMyOrders };
