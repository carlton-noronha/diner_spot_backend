const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Order = new Schema(
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
		quantity: {
			type: Schema.Types.Number,
			required: true,
		},
		amountPaid: {
			type: Schema.Types.Number,
			required: true,
		},
	},
	{ collection: "Order" }
);

module.exports = Order;
