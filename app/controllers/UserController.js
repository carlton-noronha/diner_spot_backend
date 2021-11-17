const {
	CustomerModel,
	RestaurantModel,
	OrderModel,
	DishModel,
} = require("../models");

const displayError = (err) => console.log(`Error: ${err}`);

module.exports.viewDishes = (req, res) => {
	const limit = Number.parseInt(req.query.limit);
	const page = Number.parseInt(req.query.page);

	RestaurantModel.find()
		.populate("dishes")
		.exec()
		.then((restaurants) => {
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
						restaurantLocation: restaurant.location
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
	const { customerId, restaurantId, dishId, amountPaid } = req.body;
	OrderModel({ customerId, restaurantId, dishId, amountPaid })
		.save()
		.then((order) => {
			return CustomerModel.findByIdAndUpdate(customerId, {
				$push: { orders: order["_id"] },
			}).exec();
		})
		.then((data) => {
			console.log("Add to your orders", data);
			return res.status(200).json({ message: "Sucess!" });
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
				promises.push(OrderModel.findById(orderId).populate("dishId").populate("restaurantId").exec());
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
