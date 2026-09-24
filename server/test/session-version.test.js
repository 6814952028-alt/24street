const test = require("node:test");
const assert = require("node:assert/strict");

const sessionIsCurrent = (tokenVersion, userVersion) => (tokenVersion || 0) === (userVersion || 0);

test("a token is accepted while its session version matches", () => {
  assert.equal(sessionIsCurrent(2, 2), true);
});
test("logout invalidates a prior token by changing the session version", () => {
  assert.equal(sessionIsCurrent(2, 3), false);
});
