const Product = require("../models/product.model");

const getProducts = async (req, res, next) => {
  try {
    const filter = { status: "active" };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured === "true") filter.featured = true;
    if (req.query.q) filter.$text = { $search: req.query.q };

    const products = await Product.find(filter).sort({ featured: -1, createdAt: -1 });
    res.json(products);
  } catch (error) { next(error); }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: "active" });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) { next(error); }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) { next(error); }
};

const getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ updatedAt: -1 });
    res.json(products);
  } catch (error) { next(error); }
};

const updateProduct = async (req, res, next) => {
  try {
    const allowed = ["name", "slug", "category", "price", "compareAtPrice", "description", "materials", "care", "images", "variants", "featured", "status"];
    const changes = Object.fromEntries(allowed.filter(key => req.body[key] !== undefined).map(key => [key, req.body[key]]));
    const product = await Product.findByIdAndUpdate(req.params.id, changes, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) { next(error); }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { status: "archived" }, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product archived", product });
  } catch (error) { next(error); }
};

module.exports = { getProducts, getProductBySlug, createProduct, getAdminProducts, updateProduct, deleteProduct };
