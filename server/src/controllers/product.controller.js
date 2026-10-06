const Product = require("../models/product.model");

const categoryAliases = {
  tee: "t-shirts", tees: "t-shirts", tshirt: "t-shirts", tshirts: "t-shirts", "t-shirt": "t-shirts", "t-shirts": "t-shirts",
  hoodie: "hoodies", hoodies: "hoodies", sweatshirt: "sweatshirts", sweatshirts: "sweatshirts", "sweat-shirt": "sweatshirts", "sweat-shirts": "sweatshirts",
  pant: "baggy-pants", pants: "baggy-pants", baggy: "baggy-pants", baggies: "baggy-pants", jeans: "baggy-pants", "baggy-pant": "baggy-pants", "baggy-pants": "baggy-pants",
  short: "shorts", shorts: "shorts", bag: "bags", bags: "bags", cap: "headwear", caps: "headwear", hat: "headwear", hats: "headwear", headwear: "headwear", boxer: "underwear", boxers: "underwear", underwear: "underwear", accessory: "accessories", accessories: "accessories",
};
const normalizeCategory = value => {
  const key = String(value || "").trim().toLowerCase().replace(/[_\s]+/g, "-");
  return categoryAliases[key] || key;
};

const defaultVariants = slug => [{
  size: "Free Size",
  color: "Default",
  sku: `${String(slug || "PRODUCT")}-FREE-SIZE`.toUpperCase(),
  stock: 100,
}];
const normalizeProductInput = input => ({
  ...input,
  images: Array.isArray(input.images) ? input.images.map(url => String(url).trim()).filter(Boolean) : [],
  variants: Array.isArray(input.variants) && input.variants.length ? input.variants : defaultVariants(input.slug),
});

const getProducts = async (req, res, next) => {
  try {
    const filter = { status: "active" };
    if (req.query.category) filter.category = normalizeCategory(req.query.category);
    if (req.query.featured === "true") filter.featured = true;
    if (req.query.q) filter.$text = { $search: req.query.q };

    const products = await Product.find(filter).sort({ _id: -1 });
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
    const product = await Product.create(normalizeProductInput(req.body));
    res.status(201).json(product);
  } catch (error) { next(error); }
};

const getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ _id: -1 });
    res.json(products);
  } catch (error) { next(error); }
};

const updateProduct = async (req, res, next) => {
  try {
    const allowed = ["name", "slug", "category", "price", "compareAtPrice", "description", "materials", "care", "images", "variants", "featured", "status"];
    const changes = Object.fromEntries(allowed.filter(key => req.body[key] !== undefined).map(key => [key, req.body[key]]));
    if (changes.images !== undefined) changes.images = Array.isArray(changes.images) ? changes.images.map(url => String(url).trim()).filter(Boolean) : [];
    if (Array.isArray(changes.variants) && !changes.variants.length) changes.variants = defaultVariants(changes.slug || req.body.slug);
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

module.exports = { getProducts, getProductBySlug, createProduct, getAdminProducts, updateProduct, deleteProduct, normalizeCategory };
