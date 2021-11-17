const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Restaurant = new Schema(
	{
		name: { type: String, required: true },
		location: { type: String, required: true },
		cuisineType: {
			type: [{ type: String }],
		},
		dishes: {
			type: [{ type: Schema.Types.ObjectId, ref: "Dish" }],
			required: true,
		},
		opensAt: { type: String, required: true },
		closesAt: { type: String, required: true },
	},
	{ collection: "Restaurant" }
);

module.exports = Restaurant;
