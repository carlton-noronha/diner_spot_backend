const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PendingOrder = new Schema(
	{
		customerId: {
			type: Schema.Types.ObjectId,
			ref: "Customer",
			required: true,
		},
		restaurantId: {
			type: Schema.Types.ObjectId,
			ref: "Restaurant",
			required: true,
		},
		dishId: {
			type: Schema.Types.ObjectId,
			ref: "Dish",
			required: true,
		},
		amountPaid: {
			type: Schema.Types.Number,
			required: true,
		},
	},
	{ collection: "PendingOrder" }
);

module.exports = PendingOrder;
