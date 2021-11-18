const mongoose = require("mongoose");

module.exports = mongoose.model(
	"PendingOrderModel",
	require("../schemas/PendingOrder")
);
