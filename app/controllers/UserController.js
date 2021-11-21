const {
	CustomerModel,
	RestaurantModel,
	OrderModel,
	PendingOrderModel,
	DishModel,
} = require("../models");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const displayError = (err) => console.log(`Error: ${err}`);

module.exports.viewDishes = (req, res) => {
	const limit = Number.parseInt(req.query.limit);
	const page = Number.parseInt(req.query.page);
	console.log(limit, page);
	RestaurantModel.find()
		.populate("dishes")
		.exec()
		.then((restaurants) => {
			console.log(restaurants.length);
			let dishes = [];
			for (const restaurant of restaurants) {
				restaurant.dishes.forEach(({ _id, image, name, price }) => {
					dishes.push({
						_id,
						image,
						name,
						price,
						restaurantId: restaurant["_id"],
						restaurantName: restaurant.name,
						restaurantLocation: restaurant.location,
					});
				});
			}
			dishes = dishes.slice((page - 1) * limit, page * limit);
			return res.status(200).json({ dishes });
		})
		.catch((err) => {
			displayError(err);
			return res.status(500).json({ message: "Server Error!" });
		});
};

module.exports.addToMyOrders = (req, res) => {
	const { customerId, restaurantId, dishId, quantity, amountPaid } = req.body;
	PendingOrderModel({ customerId, restaurantId, dishId, quantity, amountPaid })
		.save()
		.then((data) => {
			console.log("Add to pending orders waiting for admin approval", data);
			return res.status(200).json({ message: "Sucess!" });
		})
		.catch((err) => {
			displayError(err);
			return res.status(500).json({ message: "Server Error!" });
		});
};

module.exports.searchDish = (req, res) => {
	const search = req.query.q;
	RestaurantModel.find()
		.populate("dishes")
		.exec()
		.then((restaurants) => {
			const dishes = [];
			for (const restaurant of restaurants) {
				restaurant.dishes.forEach(({ _id, image, name, price }) => {
					if (name.search(new RegExp(search, "gi")) !== -1) {
						dishes.push({
							_id,
							image,
							name,
							price,
							restaurantId: restaurant["_id"],
							restaurantName: restaurant.name,
							restaurantLocation: restaurant.location,
						});
					}
				});
			}
			return res.status(200).json({ dishes });
		})
		.catch((err) => {
			displayError(err);
			return res.status(500).json({ message: "Server Error!" });
		});
};

module.exports.viewMyOrders = (req, res) => {
	const limit = Number.parseInt(req.query.limit);
	const page = Number.parseInt(req.query.page);

	const { customerId } = req.body;
	CustomerModel.findById(customerId)
		.exec()
		.then((customer) => {
			const promises = [];
			for (const orderId of customer.orders) {
				promises.push(
					OrderModel.findById(orderId)
						.populate("dishId")
						.populate("restaurantId")
						.exec()
				);
			}
			return Promise.all(promises);
		})
		.then((dishes) => {
			const paginatedDishes = dishes.slice((page - 1) * limit, page * limit);
			return res.status(200).json({ orders: paginatedDishes });
		})
		.catch((err) => {
			displayError(err);
			return res.status(500).json({ message: "Server Error!" });
		});
};

module.exports.ordersCount = async (req, res) => {
	try {
		const customer = await CustomerModel.findById(req.body.customerId, {
			orders: 1,
		}).exec();
		return res.status(200).json({ count: customer.orders.length });
	} catch (err) {
		return res.status(500).json({ message: "Server Error!" });
	}
};

module.exports.dishesCount = async (req, res) => {
	try {
		const count = await DishModel.estimatedDocumentCount();
		return res.status(200).json({ count });
	} catch (err) {
		return res.status(500).json({ message: "Server Error!" });
	}
};

module.exports.makePayment = async (req, res) => {
	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			mode: "payment",
			line_items: req.body.dishes.map((item) => {
				return {
					price_data: {
						currency: "INR",
						product_data: {
							name: item.name,
						},
						unit_amount: item.price / 0.01,
					},
					quantity: item.quantity,
				};
			}),
			success_url: `${process.env.CLIENT_URL}/success`,
			cancel_url: `${process.env.CLIENT_URL}/failed`,
		});
		res.json({ url: session.url });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};
