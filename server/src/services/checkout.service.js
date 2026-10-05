const SHIPPING = { standard: 50, express: 120, cod: 80 };
const FREE_SHIPPING_AT = 1500;
const PAYMENT_METHODS = ["promptpay", "card", "bank_transfer", "cod"];
const SHIPPING_METHODS = ["standard", "express", "cod"];
const totalsFor = (items, method = "standard") => { const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0); const shippingFee = method === "standard" && subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING[method]; return { subtotal, shippingFee, total: subtotal + shippingFee }; };
const createOrderNumber = () => "24-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();
const validateAddress = address => {
  const fields = ["recipient", "phone", "email", "line1", "subdistrict", "district", "province", "postalCode"];
  if (!address || fields.some(key => typeof address[key] !== "string" || !address[key].trim())) return "Complete all delivery address fields";
  if (!/^\+?[0-9 ()-]{8,24}$/.test(address.phone.trim())) return "Enter a valid phone number";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) return "Enter a valid email address";
  if (!/^\d{5}$/.test(address.postalCode.trim())) return "Enter a 5-digit postal code";
  return null;
};
module.exports = { SHIPPING, FREE_SHIPPING_AT, PAYMENT_METHODS, SHIPPING_METHODS, totalsFor, createOrderNumber, validateAddress };

