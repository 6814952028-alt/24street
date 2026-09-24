const express = require("express");
const { getProducts, getProductBySlug, createProduct, getAdminProducts, updateProduct, deleteProduct } = require("../controllers/product.controller");
const { protect, requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();
router.get("/", getProducts);
router.get("/admin/all", protect, requireAdmin, getAdminProducts);
router.post("/", protect, requireAdmin, createProduct);
router.patch("/:id", protect, requireAdmin, updateProduct);
router.delete("/:id", protect, requireAdmin, deleteProduct);
router.get("/:slug", getProductBySlug);

module.exports = router;
