require("dotenv").config();

const connectDB = require("../config/db");
const Product = require("../models/product.model");

const imageByCategory = {
  "t-shirts": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85",
  "baggy-pants": "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=85",
  hoodies: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85",
  sweatshirts: "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=1200&q=85",
  jackets: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=85",
  shorts: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1200&q=85",
  bags: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85",
  headwear: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?auto=format&fit=crop&w=1200&q=85",
  underwear: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85",
  accessories: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=85",
};

const sizes = ["S", "M", "L", "XL"];
const colors = ["Black", "Off White"];
const safeSkuPart = value => value.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
const categoryAliases = {
  TEES: "t-shirts",
  TEE: "t-shirts",
  "T-SHIRTS": "t-shirts",
  PANTS: "baggy-pants",
  "BAGGY PANTS": "baggy-pants",
  HOODIE: "hoodies",
  HOODIES: "hoodies",
  SWEATSHIRT: "sweatshirts",
  SWEATSHIRTS: "sweatshirts",
  JACKET: "jackets",
  JACKETS: "jackets",
  SHORTS: "shorts",
  BAG: "bags",
  BAGS: "bags",
  CAP: "headwear",
  CAPS: "headwear",
  HEADWEAR: "headwear",
  UNDERWEAR: "underwear",
  ACCESSORY: "accessories",
  ACCESSORIES: "accessories",
};

async function repairCatalog() {
  await connectDB();
  const products = await Product.find({});
  let updated = 0;

  for (const product of products) {
    const normalizedCategory = categoryAliases[String(product.category || "").trim().toUpperCase()];
    product.category = normalizedCategory || (imageByCategory[product.category] ? product.category : "t-shirts");
    if (!product.slug) {
      const nameSlug = String(product.name || "product").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      product.slug = `${nameSlug || "product"}-${String(product._id).slice(-6)}`;
    }
    const priorVariants = product.variants
      .map(variant => variant.toObject())
      .filter(variant => variant.size && variant.color && variant.sku);
    const byOption = new Map(priorVariants.map(variant => [`${variant.size}\u0000${variant.color}`,
      { ...variant, stock: Math.max(variant.stock || 0, 12) }]));

    for (const color of colors) {
      for (const size of sizes) {
        const key = `${size}\u0000${color}`;
        if (!byOption.has(key)) {
          byOption.set(key, {
            size,
            color,
            sku: `${safeSkuPart(product.slug)}-${safeSkuPart(color)}-${size}`,
            stock: 12,
          });
        }
      }
    }

    product.images = [imageByCategory[product.category] || imageByCategory["t-shirts"]];
    product.variants = [...byOption.values()];
    await product.save();
    updated += 1;
  }

  console.log(`Repaired catalog data for ${updated} products.`);
}

repairCatalog()
  .catch(error => {
    console.error("Catalog repair failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = require("mongoose");
    await mongoose.disconnect();
  });
