const test = require("node:test");
const assert = require("node:assert/strict");
const { isAdmin, canEditUser } = require("../src/services/authorization.service");

test("recognizes the admin role only", () => {
  assert.equal(isAdmin({ role: "admin" }), true);
  assert.equal(isAdmin({ role: "customer" }), false);
});
test("only admin or account owner can edit a user", () => {
  assert.equal(canEditUser({ _id: "a", role: "customer" }, { _id: "a" }), true);
  assert.equal(canEditUser({ _id: "a", role: "customer" }, { _id: "b" }), false);
  assert.equal(canEditUser({ _id: "a", role: "admin" }, { _id: "b" }), true);
});
