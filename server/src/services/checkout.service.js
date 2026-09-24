const SHIPPING_FEE = 50;
const FREE_SHIPPING_AT = 1500;

const totalsFor = items => {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingFee = subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE;
  return { subtotal, shippingFee, total: subtotal + shippingFee };
};

const createOrderNumber = () => `24-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

module.exports = { SHIPPING_FEE, FREE_SHIPPING_AT, totalsFor, createOrderNumber };
