require("dotenv").config();

const connectDB = require("../config/db");
const Product = require("../models/product.model");

const categoryMigrations = {
  TEES: "t-shirts", TEE: "t-shirts", "T-SHIRTS": "t-shirts", "T SHIRTS": "t-shirts",
  HOODIE: "hoodies", HOODIES: "hoodies", SWEATSHIRT: "sweatshirts", SWEATSHIRTS: "sweatshirts",
  PANTS: "baggy-pants", BAGGIES: "baggy-pants", "BAGGY PANTS": "baggy-pants", SHORTS: "shorts",
  BAGS: "bags", TOTE: "bags", CAP: "headwear", CAPS: "headwear", HEADWEAR: "headwear", BOXERS: "underwear", UNDERWEAR: "underwear",
};
const thaiCategory = {
  "t-shirts": "เสื้อยืด", hoodies: "เสื้อฮู้ด", sweatshirts: "เสื้อสเวตเชิ้ต", "baggy-pants": "กางเกงขายาว", shorts: "กางเกงขาสั้น", bags: "กระเป๋า", headwear: "หมวก", underwear: "ชุดชั้นใน", jackets: "เสื้อคลุม", accessories: "เครื่องประดับ",
};

const variantsFor = (prefix, color, oneSize = false) => (oneSize ? ["One Size"] : ["S", "M", "L", "XL"]).map(size => ({
  size,
  color,
  sku: `${prefix}-${color.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}-${size}`,
  stock: 12,
}));

const products = [
  { name: "City Core Heavy Tee", nameTh: "เสื้อยืดซิตี้คอร์คอตตอนหนา", slug: "city-core-heavy-tee", category: "t-shirts", price: 890, description: "A relaxed heavyweight cotton tee built for daily rotation.", materials: ["100% cotton", "240 GSM"], images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85"], featured: true },
  { name: "After Hours Long Sleeve", nameTh: "เสื้อแขนยาวอาฟเตอร์อาวร์ส", slug: "after-hours-long-sleeve", category: "t-shirts", price: 1090, description: "A soft long sleeve layer with an easy oversized fit.", materials: ["100% cotton", "210 GSM"], images: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=85"] },
  { name: "Metro Pullover Hoodie", nameTh: "เสื้อฮู้ดเมโทร", slug: "metro-pullover-hoodie", category: "hoodies", price: 1890, description: "A substantial brushed fleece hoodie for cooler evenings.", materials: ["Cotton blend", "420 GSM fleece"], images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85"], featured: true },
  { name: "Weekend Crew Sweatshirt", nameTh: "เสื้อสเวตเชิ้ตคอกลมวีกเอนด์", slug: "weekend-crew-sweatshirt", category: "sweatshirts", price: 1590, description: "A clean crew neck sweatshirt with a roomy streetwear silhouette.", materials: ["Cotton blend", "380 GSM fleece"], images: ["https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=1200&q=85"] },
  { name: "Wide Route Baggies", nameTh: "กางเกงทรงหลวมไวด์รูต", slug: "wide-route-baggies", category: "baggy-pants", price: 1690, description: "Wide leg utility trousers with room to move.", materials: ["Cotton twill", "Garment washed"], images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=85"], featured: true },
  { name: "Transit Carpenter Pants", nameTh: "กางเกงคาร์เพนเตอร์ทรานซิต", slug: "transit-carpenter-pants", category: "baggy-pants", price: 1790, description: "Relaxed carpenter pants with functional pocketing.", materials: ["Cotton canvas", "Reinforced seams"], images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=85"] },
  { name: "Weekend Mesh Shorts", nameTh: "กางเกงขาสั้นตาข่ายวีกเอนด์", slug: "weekend-mesh-shorts", category: "shorts", price: 990, description: "Lightweight mesh shorts with an elastic waist for everyday comfort.", materials: ["Polyester mesh", "Drawcord waist"], images: ["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1200&q=85"] },
  { name: "Canvas Day Tote", nameTh: "กระเป๋าผ้าแคนวาสเดย์โท้ต", slug: "canvas-day-tote", category: "bags", price: 590, description: "A sturdy everyday carryall sized for daily essentials.", materials: ["Heavy cotton canvas"], images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85"], oneSize: true },
  { name: "Night Shift Cap", nameTh: "หมวกแก๊ปไนต์ชิฟต์", slug: "night-shift-cap", category: "headwear", price: 490, description: "A low profile cap finished with an adjustable back strap.", materials: ["Cotton twill", "Adjustable strap"], images: ["https://images.unsplash.com/photo-1588850561407-ed78c334e67a?auto=format&fit=crop&w=1200&q=85"], oneSize: true },
  { name: "Daily Cotton Boxers", nameTh: "บ็อกเซอร์คอตตอนเดลี", slug: "daily-cotton-boxers", category: "underwear", price: 390, description: "Soft cotton stretch boxers designed for everyday wear.", materials: ["Cotton stretch", "Breathable jersey"], images: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85"] },
  { name: "Utility Crossbody Bag", nameTh: "กระเป๋าสะพายยูทิลิตี้", slug: "utility-crossbody-bag", category: "bags", price: 890, description: "A compact crossbody with adjustable webbing and zip storage.", materials: ["Recycled nylon", "Metal zip"], images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85"], oneSize: true },
  { name: "City Key Clip", nameTh: "พวงกุญแจคลิปซิตี้", slug: "city-key-clip", category: "accessories", price: 290, description: "A sturdy clip for keys and small daily essentials.", materials: ["Recycled webbing", "Metal clip"], images: ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=85"], oneSize: true },
  { name: "Everyday Cargo Jeans", nameTh: "ยีนส์คาร์โก้เอเวอรี่เดย์", slug: "everyday-cargo-jeans", category: "baggy-pants", price: 1890, description: "Relaxed denim jeans with roomy utility pockets.", materials: ["Cotton denim", "Garment washed"], images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=85"] },
  { name: "Workday Overshirt", nameTh: "เสื้อคลุมโอเวอร์เชิ้ตเวิร์กเดย์", slug: "workday-overshirt", category: "jackets", price: 1990, description: "A versatile overshirt that works as a light outer layer.", materials: ["Cotton blend", "Matte metal buttons"], images: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=85"] },
];

async function seedCatalog() {
  await connectDB();
  for (const [legacyCategory, category] of Object.entries(categoryMigrations)) {
    await Product.updateMany({ category: legacyCategory }, { $set: { category } });
  }
  await Product.updateOne({ slug: "weekend-crew-sweatshirt" }, { $set: { category: "sweatshirts" } });
  await Product.updateOne({ slug: "canvas-day-tote" }, { $set: { category: "bags" } });
  await Product.updateOne({ slug: "night-shift-cap" }, { $set: { category: "headwear" } });
  for (const product of products) {
    const variants = [...variantsFor(product.slug, "Black", product.oneSize), ...variantsFor(product.slug, "Off White", product.oneSize)];
    const { oneSize, name, nameTh, category, ...catalogProduct } = product;
    await Product.updateOne(
      { slug: product.slug },
      {
        $set: { name: nameTh, nameEn: name, category: product.category, categoryTh: thaiCategory[product.category] },
        $setOnInsert: { ...catalogProduct, variants, care: ["Machine wash cold", "Do not tumble dry"], status: "active" },
      },
      { upsert: true, runValidators: true },
    );
  }
  console.log(`Catalog seed is ready (${products.length} sample products).`);
}

seedCatalog()
  .catch(error => {
    console.error("Catalog seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = require("mongoose");
    await mongoose.disconnect();
  });
