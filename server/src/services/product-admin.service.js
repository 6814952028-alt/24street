const slugify = value => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const emptyProduct = () => ({ name: "", slug: "", category: "t-shirts", price: 0, description: "", materials: [], care: [], images: [], variants: [], featured: false, status: "active" });

module.exports = { slugify, emptyProduct };
