const { CustomerModel } = require("../models");

module.exports.checkDuplicateEmail = (req, res, next) => {
	CustomerModel.findOne({
		email: req.body.email,
	})
		.exec()
		.then((user) => {
			if (user) {
				return res.status(401).json({ message: "Email already exist!" });
			}
			console.log("VerifySignUpMiddleware: No duplicate email found!");
			next();
		})
		.catch((err) => {
			console.log(`Error: ${err}`);
			return res.status(500).json({ message: "Server Error" });
		});
};
