const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Role = new Schema(
	{
		type: { type: String, required: true },
	},
	{ collection: "Role" }
);

module.exports = Role;
