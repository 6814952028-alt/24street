const express = require("express"); const { protect } = require("../middlewares/auth.middleware"); const { checkout, getMyOrders } = require("../controllers/order.controller");
const router = express.Router(); router.use(protect); router.get("/", getMyOrders); router.post("/checkout", checkout); module.exports = router;
