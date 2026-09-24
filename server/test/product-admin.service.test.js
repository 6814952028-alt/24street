const test = require("node:test");
const assert = require("node:assert/strict");
const { slugify, emptyProduct } = require("../src/services/product-admin.service");

test("creates a URL-safe product slug", () => assert.equal(slugify("Heavyweight Tee / Black"), "heavyweight-tee-black"));
test("new admin product starts as an active valid shape", () => assert.equal(emptyProduct().status, "active"));
