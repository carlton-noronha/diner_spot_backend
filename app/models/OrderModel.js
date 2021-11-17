const mongoose = require("mongoose");

module.exports = mongoose.model("Order", require("../schemas/Order"));
