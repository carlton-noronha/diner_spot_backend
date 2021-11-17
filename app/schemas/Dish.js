const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Dish = new Schema(
	{
		image: {
			type: "String",
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		price: {
			type: Schema.Types.Number,
			required: true,
		},
		offer: {
			type: [{ type: String }],
		},
	},
	{ collection: "Dish" }
);

module.exports = Dish;
