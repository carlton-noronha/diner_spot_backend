const { CustomerModel, RoleModel } = require("../models");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
const { secret } = require("../config/AuthConfig");

module.exports.signup = (req, res, next) => {
	const { name, email, password } = req.body;

	RoleModel.findOne({ type: "User" }, { _id: 1 })
		.exec()
		.then((role) => {
			bcrypt
				.hash(password, 10)
				.then((hashedPassword) => {
					const user = new CustomerModel({
						name,
						email,
						password: hashedPassword,
						orders: [],
						customerType: "Free",
						roles: [role["_id"]],
					});
					return user.save();
				})
				.then((data) => {
					console.log(`AuthController: Successful created user: ${data}`);
					return res
						.status(200)
						.json({ message: "Account created successfully!" });
				});
		})
		.catch((err) => {
			console.log(`AuthController => Error: ${err}`);
			return res.status(500).json({ message: "Server Error" });
		});
};

module.exports.signin = (req, res, next) => {
	CustomerModel.findOne({
		email: req.body.email,
	})
		.populate("roles")
		.exec()
		.then((user) => {
			if (!user) {
				return res.status(404).json({
					message: `Email not found! Create an account`,
				});
			}
			bcrypt
				.compare(req.body.password, user.password)
				.then((passwordIsValid) => {
					if (!passwordIsValid) {
						return res.status(401).json({ message: "Incorrect Password" });
					}
					jwt.sign(
						{ customerId: user["_id"] },
						secret,
						{
							expiresIn: 10800, // 3 hours
						},
						(err, token) => {
							if (err) {
								console.log(`AuthController => Error: ${err}`);
								return res.status(500).json({ message: "Server Error" });
							} else {
								// const authorities = [];
								let isAdmin = false;

								for (const role of user.roles) {
									// authorities.push("ROLE_" + role.type.toUpperCase());
									if (role.type === "Admin") {
										isAdmin = true;
									}
								}

								return res.status(200).json({
									customerId: user["_id"],
									email: user.email,
									isAdmin,
									accessToken: token,
								});
							}
						}
					);
				});
		})
		.catch((err) => {
			console.log(`AuthController => Error: ${err}`);
			return res.status(500).json({ message: "Server Error" });
		});
};
