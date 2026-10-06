const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const { put, get } = require("@vercel/blob");
const { Readable } = require("node:stream");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const { PAYMENT_METHODS, SHIPPING_METHODS, totalsFor, createOrderNumber, validateAddress } = require("../services/checkout.service");
const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const appOrigin = () => (process.env.APP_URL || (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",")[0]).replace(/\/$/, "");
const parseJsonField = (value, fallback) => {
  if (typeof value !== "string") return value ?? fallback;
  try { return JSON.parse(value); } catch { return fallback; }
};
const paymentInfo = () => ({
  bankName: process.env.BANK_NAME || "",
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || "",
  accountName: process.env.BANK_ACCOUNT_NAME || "",
  promptpayNumber: process.env.PROMPTPAY_NUMBER || "",
  promptpayQrUrl: process.env.PROMPTPAY_QR_URL || "",
  instructions: process.env.BANK_TRANSFER_INSTRUCTIONS || "",
});
const publicOrder = order => {
  const value = order?.toObject ? order.toObject() : { ...order };
  if (value?.paymentDetails) {
    delete value.paymentDetails.transferSlipData;
    delete value.paymentDetails.transferSlipContentType;
  }
  return value;
};

const stripePost = async (path, params, key) => {
  if (!process.env.STRIPE_SECRET_KEY) throw fail("Online payment is not configured", 503);
  const response = await fetch("https://api.stripe.com/v1/" + path, { method: "POST", headers: { Authorization: "Basic " + Buffer.from(process.env.STRIPE_SECRET_KEY + ":").toString("base64"), "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": key }, body: params.toString() });
  const data = await response.json();
  if (!response.ok) throw fail(data.error?.message || "Payment provider could not start checkout", 502);
  return data;
};

const createStripeSession = async order => {
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("expires_at", String(Math.floor(Date.now() / 1000) + 3600));
  params.set("payment_method_types[0]", order.paymentDetails.method === "promptpay" ? "promptpay" : "card");
  params.set("client_reference_id", String(order._id));
  params.set("metadata[orderId]", String(order._id));
  params.set("customer_email", order.shippingAddress.email);
  params.set("success_url", appOrigin() + "/?checkout=success&order=" + encodeURIComponent(order.orderNumber));
  params.set("cancel_url", appOrigin() + "/?checkout=cancel&order=" + encodeURIComponent(order.orderNumber));
  order.items.forEach((item, i) => {
    const p = "line_items[" + i + "]";
    params.set(p + "[price_data][currency]", "thb");
    params.set(p + "[price_data][unit_amount]", String(Math.round(item.unitPrice * 100)));
    params.set(p + "[price_data][product_data][name]", item.name + " / " + item.size);
    if (item.color) params.set(p + "[price_data][product_data][description]", item.color);
    params.set(p + "[quantity]", String(item.quantity));
  });
  if (order.shippingFee > 0) {
    params.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
    params.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(Math.round(order.shippingFee * 100)));
    params.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "thb");
    params.set("shipping_options[0][shipping_rate_data][display_name]", order.shippingMethod === "express" ? "Express delivery" : "Delivery");
  }
  return stripePost("checkout/sessions", params, "order-" + order._id);
};

const releaseInventory = async (order, session) => {
  if (order.inventoryReleasedAt) return;
  for (const item of order.items) await Product.updateOne({ _id: item.productId, variants: { $elemMatch: { sku: item.sku } } }, { $inc: { "variants.$.stock": item.quantity } }, { session });
  order.inventoryReleasedAt = new Date();
};
const setPaymentStatus = async (orderId, status, intentId = "") => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order || order.paymentStatus === "paid") return;
      if (status === "failed") await releaseInventory(order, session);
      order.paymentStatus = status;
      if (intentId) order.paymentDetails.stripePaymentIntentId = intentId;
      if (status === "paid" && !order.inventoryReleasedAt && order.orderStatus === "pending") order.orderStatus = "processing";
      await order.save({ session });
    });
  } finally { await session.endSession(); }
};

const createOrder = async (req, res, next) => {
  let session;
  try {
    const body = req.body || {};
    body.shippingAddress = parseJsonField(body.shippingAddress, {});
    body.items = parseJsonField(body.items, []);
    const addressError = validateAddress(body.shippingAddress);
    if (addressError) return res.status(400).json({ message: addressError });
    const shippingMethod = body.shippingMethod || "standard";
    const paymentMethod = body.paymentMethod || "promptpay";
    if (!SHIPPING_METHODS.includes(shippingMethod) || !PAYMENT_METHODS.includes(paymentMethod)) return res.status(400).json({ message: "Choose a valid delivery and payment method" });
    if ((paymentMethod === "cod") !== (shippingMethod === "cod")) return res.status(400).json({ message: "Cash on delivery must use COD shipping" });
    if (["card", "promptpay"].includes(paymentMethod) && !process.env.STRIPE_SECRET_KEY) return res.status(503).json({ message: "Online payment is not configured yet" });
    if (paymentMethod === "bank_transfer" && !req.file) return res.status(400).json({ message: "Upload your bank transfer slip to place this order" });
    const clientKey = String(body.idempotencyKey || "");
    if (clientKey.length < 16 || clientKey.length > 120) return res.status(400).json({ message: "A valid checkout idempotency key is required" });
    const idem = String(req.user._id) + ":" + clientKey;
    const cart = await Cart.findOne({ userId: req.user._id });
    const requestItems = Array.isArray(body.items) && body.items.length ? body.items : (cart?.items || []).map(x => ({ productId: x.productId, sku: x.sku, quantity: x.quantity }));
    if (!requestItems.length) return res.status(400).json({ message: "Your bag is empty" });
    if (requestItems.length > 50) return res.status(400).json({ message: "Too many different items in one order" });
    const quantities = new Map();
    for (const item of requestItems) {
      const id = String(item.productId || ""), sku = String(item.sku || "").trim(), quantity = Number(item.quantity);
      if (!mongoose.isValidObjectId(id) || !sku || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) return res.status(400).json({ message: "One or more bag items are invalid" });
      const key = id + ":" + sku;
      quantities.set(key, (quantities.get(key) || 0) + quantity);
      if (quantities.get(key) > 20) return res.status(400).json({ message: "Maximum quantity per item is 20" });
    }
    session = await mongoose.startSession();
    let order;
    await session.withTransaction(async () => {
      order = await Order.findOne({ userId: req.user._id, idempotencyKey: idem }).session(session);
      if (order) return;
      const lines = Array.from(quantities, ([key, quantity]) => { const i = key.lastIndexOf(":"); return { productId: key.slice(0, i), sku: key.slice(i + 1), quantity }; });
      const products = await Product.find({ _id: { $in: lines.map(x => x.productId) }, status: "active" }).session(session);
      const items = lines.map(line => {
        const product = products.find(x => String(x._id) === line.productId);
        const variant = product?.variants.find(x => x.sku === line.sku);
        if (!variant || product.price <= 0 || variant.stock < line.quantity) throw fail("An item is unavailable or has insufficient stock", 409);
        return { productId: product._id, name: product.name, sku: variant.sku, size: variant.size, color: variant.color, image: product.images[0] || "", unitPrice: product.price, quantity: line.quantity };
      });
      for (const item of items) {
        const result = await Product.updateOne({ _id: item.productId, status: "active", variants: { $elemMatch: { sku: item.sku, stock: { $gte: item.quantity } } } }, { $inc: { "variants.$.stock": -item.quantity } }, { session });
        if (result.modifiedCount !== 1) throw fail("Stock changed during checkout. Review your bag and try again.", 409);
      }
      const totals = totalsFor(items, shippingMethod);
      const paymentDetails = { method: paymentMethod, transferInstructions: paymentMethod === "bank_transfer" ? (process.env.BANK_TRANSFER_INSTRUCTIONS || "") : "" };
      if (paymentMethod === "bank_transfer" && req.file) {
        paymentDetails.transferSlipData = req.file.buffer;
        paymentDetails.transferSlipContentType = req.file.mimetype;
        paymentDetails.transferSubmittedAt = new Date();
      }
      [order] = await Order.create([{ orderNumber: createOrderNumber(), idempotencyKey: idem, userId: req.user._id, items, shippingAddress: { ...body.shippingAddress, email: body.shippingAddress.email.trim().toLowerCase() }, shippingMethod, ...totals, paymentStatus: "pending_payment", orderStatus: "pending", paymentDetails }], { session });
      if (cart) { cart.items = []; await cart.save({ session }); }
    });
    await session.endSession(); session = null;
    if (order.paymentStatus === "failed") return res.status(409).json({ message: "This payment attempt failed. Retry checkout to create a fresh order." });
    let checkoutUrl = order.paymentDetails.checkoutUrl || "";
    if (["card", "promptpay"].includes(paymentMethod) && !checkoutUrl) {
      try {
        const checkout = await createStripeSession(order);
        order.paymentDetails.stripeSessionId = checkout.id; order.paymentDetails.checkoutUrl = checkout.url;
        await order.save(); checkoutUrl = checkout.url;
      } catch (error) { await setPaymentStatus(order._id, "failed"); throw error; }
    }
    res.status(201).json({ order: publicOrder(order), checkoutUrl, bankTransferInstructions: order.paymentDetails.transferInstructions || "", paymentInfo: paymentInfo() });
  } catch (error) {
    if (session?.inTransaction()) await session.abortTransaction().catch(() => {});
    if (session) await session.endSession().catch(() => {});
    if (error.code === 11000 && req.body?.idempotencyKey) {
      const order = await Order.findOne({ userId: req.user._id, idempotencyKey: String(req.user._id) + ":" + req.body.idempotencyKey });
      if (order && order.paymentStatus === "failed") return res.status(409).json({ message: "This payment attempt failed. Retry checkout to create a fresh order." });
      if (order) return res.status(200).json({ order: publicOrder(order), checkoutUrl: order.paymentDetails.checkoutUrl || "", paymentInfo: paymentInfo() });
    }
    next(error);
  }
};

const getPaymentInfo = (req, res) => res.json(paymentInfo());

const getUserOrders = async (req, res, next) => { try { res.json({ orders: await Order.find({ userId: req.user._id }).select("-paymentDetails.transferSlipData").sort({ createdAt: -1 }).limit(100).lean() }); } catch (e) { next(e); } };
const getAllOrders = async (req, res, next) => {
  try { const filter = {}; if (["pending_payment", "paid", "failed"].includes(req.query.paymentStatus)) filter.paymentStatus = req.query.paymentStatus; if (["pending", "processing", "shipped", "delivered", "cancelled"].includes(req.query.orderStatus)) filter.orderStatus = req.query.orderStatus; res.json({ orders: await Order.find(filter).select("-paymentDetails.transferSlipData").populate("userId", "name email").sort({ createdAt: -1 }).limit(200).lean() }); }
  catch (e) { next(e); }
};
const updateOrderStatus = async (req, res, next) => {
  let session;
  try {
    const { orderStatus, paymentStatus, trackingNumber } = req.body || {};
    if (orderStatus !== undefined && !["pending", "processing", "shipped", "delivered", "cancelled"].includes(orderStatus)) return res.status(400).json({ message: "Invalid order status" });
    if (paymentStatus !== undefined && !["pending_payment", "paid", "failed"].includes(paymentStatus)) return res.status(400).json({ message: "Invalid payment status" });
    if (trackingNumber !== undefined && (typeof trackingNumber !== "string" || trackingNumber.length > 100)) return res.status(400).json({ message: "Invalid tracking number" });
    session = await mongoose.startSession(); let order;
    await session.withTransaction(async () => {
      order = await Order.findById(req.params.id).session(session);
      if (!order) throw fail("Order not found", 404);
      if ((orderStatus === "cancelled" || paymentStatus === "failed") && order.paymentStatus === "paid") throw fail("Refund paid orders before cancelling them", 409);
      if (order.inventoryReleasedAt && paymentStatus && paymentStatus !== order.paymentStatus) throw fail("This order released its stock reservation and cannot be reopened", 409);
      if (order.inventoryReleasedAt && orderStatus && orderStatus !== "cancelled" && orderStatus !== order.orderStatus) throw fail("This order released its stock reservation and cannot be reopened", 409);
      const nextOrderStatus = orderStatus || order.orderStatus;
      const nextPaymentStatus = paymentStatus || order.paymentStatus;
      if (["processing", "shipped", "delivered"].includes(nextOrderStatus) && nextPaymentStatus !== "paid" && order.paymentDetails.method !== "cod") throw fail("Confirm payment before fulfillment", 409);
      if (nextOrderStatus === "shipped" && !(trackingNumber || order.trackingNumber || "").trim()) throw fail("Add a tracking number before marking the order shipped", 400);
      if (orderStatus === "cancelled" || paymentStatus === "failed") await releaseInventory(order, session);
      if (orderStatus !== undefined) order.orderStatus = orderStatus;
      if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;
      if (paymentStatus === "paid" && order.orderStatus === "pending") order.orderStatus = "processing";
      if (trackingNumber !== undefined) order.trackingNumber = trackingNumber.trim();
      await order.save({ session });
    });
    await session.endSession(); session = null; res.json({ order });
  } catch (e) { if (session?.inTransaction()) await session.abortTransaction().catch(() => {}); if (session) await session.endSession().catch(() => {}); next(e); }
};

const stripeWebhook = async (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET, header = req.headers["stripe-signature"] || "";
  if (!secret) return res.status(503).json({ message: "Payment webhook is not configured" });
  const parts = Object.fromEntries(header.split(",").map(x => x.split("="))), timestamp = Number(parts.t);
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > 300 || !parts.v1 || !Buffer.isBuffer(req.body)) return res.status(400).json({ message: "Invalid payment signature" });
  const expected = crypto.createHmac("sha256", secret).update(String(timestamp) + ".").update(req.body).digest("hex"), received = Buffer.from(parts.v1, "hex"), wanted = Buffer.from(expected, "hex");
  if (received.length !== wanted.length || !crypto.timingSafeEqual(received, wanted)) return res.status(400).json({ message: "Invalid payment signature" });
  let event; try { event = JSON.parse(req.body.toString("utf8")); } catch { return res.status(400).json({ message: "Invalid webhook payload" }); }
  const object = event.data?.object || {}, orderId = object.metadata?.orderId || object.client_reference_id;
  try {
    if (orderId && ["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired"].includes(event.type)) {
      const succeeded = event.type === "checkout.session.async_payment_succeeded" || (event.type === "checkout.session.completed" && object.payment_status === "paid");
      const failed = ["checkout.session.async_payment_failed", "checkout.session.expired"].includes(event.type);
      if (succeeded) await setPaymentStatus(orderId, "paid", object.payment_intent || "");
      if (failed) await setPaymentStatus(orderId, "failed", object.payment_intent || "");
    }
    res.json({ received: true });
  } catch (e) { console.error("Stripe webhook failed:", e.message); res.status(500).json({ message: "Webhook processing failed" }); }
};
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, callback) => callback(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) });
const uploadTransferSlip = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Choose a JPG, PNG, or WebP slip up to 5 MB" });
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentDetails.method !== "bank_transfer" || order.paymentStatus !== "pending_payment" || order.orderStatus === "cancelled") return res.status(409).json({ message: "This order cannot accept a transfer slip" });
    if (process.env.PAYMENT_SLIP_BLOB_TOKEN) {
      const blob = await put("payment-slips/" + order.orderNumber + "/" + Date.now(), req.file.buffer, { access: "private", contentType: req.file.mimetype, addRandomSuffix: true, token: process.env.PAYMENT_SLIP_BLOB_TOKEN });
      order.paymentDetails.transferSlipUrl = blob.url;
      order.paymentDetails.transferSlipData = undefined;
    } else {
      order.paymentDetails.transferSlipData = req.file.buffer;
      order.paymentDetails.transferSlipContentType = req.file.mimetype;
    }
    order.paymentDetails.transferSubmittedAt = new Date(); await order.save();
    res.status(201).json({ order: publicOrder(order) });
  } catch (e) { next(e); }
};
const viewTransferSlip = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).select("+paymentDetails.transferSlipData +paymentDetails.transferSlipContentType");
    if (!order) return res.status(404).json({ message: "Order not found" });
    const url = order.paymentDetails.transferSlipUrl;
    if (url && process.env.PAYMENT_SLIP_BLOB_TOKEN) {
      const blob = await get(url, { access: "private", token: process.env.PAYMENT_SLIP_BLOB_TOKEN });
      if (!blob || blob.statusCode !== 200) return res.status(404).json({ message: "Transfer slip not found" });
      res.set({ "Content-Type": blob.blob.contentType, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store" });
      return Readable.fromWeb(blob.stream).pipe(res);
    }
    if (!order.paymentDetails.transferSlipData) return res.status(404).json({ message: "No transfer slip was uploaded" });
    res.set({ "Content-Type": order.paymentDetails.transferSlipContentType || "application/octet-stream", "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store" });
    return res.end(order.paymentDetails.transferSlipData);
  } catch (e) { next(e); }
};
module.exports = { createOrder, getPaymentInfo, getUserOrders, getAllOrders, updateOrderStatus, stripeWebhook, upload, uploadTransferSlip, viewTransferSlip };
