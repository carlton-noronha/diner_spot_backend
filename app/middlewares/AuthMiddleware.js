const { RoleModel, CustomerModel } = require("../models");
const jwt = require("jsonwebtoken");
const { secret } = require("../config/AuthConfig");

module.exports.verifyToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader.split(" ")[1]; // authHeader: Bearer <Token>
	if (token) {
		jwt.verify(token, secret, (err, decoded) => {
			if (err) {
				return res.status(500).json({ message: err });
			} else {
				req.body.customerId = decoded.customerId;
				console.log("Customer ID:", req.body.customerId);
				next();
			}
		});
	} else {
		return res.status(404).json({ message: "No token received!" });
	}
};

module.exports.isAdmin = (req, res, next) => {
	CustomerModel.findById(req.body.customerId)
		.exec()
		.then((user) => {
			return RoleModel.find({
				_id: { $in: user.roles },
			}).exec();
		})
		.then((roles) => {
			for (const role of roles) {
				if (role.type === "Admin") {
					next();
					return;
				}
			}
			return res
				.status(401)
				.json({ message: "Admin previledge not granted to your account!" });
		})
		.catch((err) => {
			console.log(`Error: ${err}`);
			return res.status(500).json({ message: "Server Error" });
		});
};
