const isAdmin = user => user?.role === "admin";
const canEditUser = (actor, target) => isAdmin(actor) || String(actor?._id) === String(target?._id);

module.exports = { isAdmin, canEditUser };
