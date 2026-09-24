const test = require("node:test");
const assert = require("node:assert/strict");
const { totalsFor, FREE_SHIPPING_AT } = require("../src/services/checkout.service");

test("adds Thai delivery fee for orders under free-delivery threshold", () => {
  assert.deepEqual(totalsFor([{ unitPrice: 890, quantity: 1 }]), { subtotal: 890, shippingFee: 50, total: 940 });
});
test("makes delivery free at threshold", () => {
  assert.deepEqual(totalsFor([{ unitPrice: FREE_SHIPPING_AT, quantity: 1 }]), { subtotal: FREE_SHIPPING_AT, shippingFee: 0, total: FREE_SHIPPING_AT });
});
