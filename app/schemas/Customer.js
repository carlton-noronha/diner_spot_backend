const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Customer = new Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true },
		password: { type: String, required: true },
		orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
		customerType: { type: String, enum: ["Free", "Premium"] },
		roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
	},
	{ collection: "Customer" }
);

module.exports = Customer;
