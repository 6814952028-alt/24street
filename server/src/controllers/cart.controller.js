const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

const detail = async cart => {
  const products = await Product.find({ _id: { $in: cart.items.map(item => item.productId) } });
  return cart.items.map(item => {
    const product = products.find(p => p._id.equals(item.productId));
    const variant = product?.variants.find(v => v.sku === item.sku);
    return product && variant ? { productId: product._id, name: product.name, slug: product.slug, image: product.images[0], price: product.price, sku: item.sku, size: variant.size, color: variant.color, stock: variant.stock, quantity: item.quantity } : null;
  }).filter(Boolean);
};

const getCart = async (req, res, next) => { try { const cart = await Cart.findOne({ userId: req.user._id }) || { items: [] }; res.json({ items: await detail(cart) }); } catch (e) { next(e); } };
const addItem = async (req, res, next) => {
  try {
    const { productId, sku, quantity = 1 } = req.body;
    const product = await Product.findOne({ _id: productId, status: "active", variants: { $elemMatch: { sku, stock: { $gte: quantity } } } });
    if (!product) return res.status(400).json({ message: "Selected item is unavailable" });
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) cart = new Cart({ userId: req.user._id, items: [] });
    const existing = cart.items.find(item => item.productId.equals(productId) && item.sku === sku);
    if (existing) existing.quantity = Math.min(existing.quantity + Number(quantity), 20); else cart.items.push({ productId, sku, quantity });
    await cart.save(); res.status(201).json({ items: await detail(cart) });
  } catch (e) { next(e); }
};
const updateItem = async (req, res, next) => { try { const cart = await Cart.findOne({ userId: req.user._id }); if (!cart) return res.status(404).json({ message: "Cart not found" }); const item = cart.items.find(x => x.sku === req.params.sku); if (!item) return res.status(404).json({ message: "Item not found" }); const quantity = Number(req.body.quantity); if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return res.status(400).json({ message: "Quantity must be between 1 and 20" }); item.quantity = quantity; await cart.save(); res.json({ items: await detail(cart) }); } catch (e) { next(e); } };
const removeItem = async (req, res, next) => { try { const cart = await Cart.findOne({ userId: req.user._id }); if (!cart) return res.json({ items: [] }); cart.items = cart.items.filter(item => item.sku !== req.params.sku); await cart.save(); res.json({ items: await detail(cart) }); } catch (e) { next(e); } };
module.exports = { getCart, addItem, updateItem, removeItem };
