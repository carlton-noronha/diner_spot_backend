const mongoose = require("mongoose");

module.exports = mongoose.model("Customer", require("../schemas/Customer"));
