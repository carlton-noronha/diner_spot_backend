const {
	RestaurantModel,
	DishModel,
	OrderModel,
	CustomerModel,
} = require("../models");

const displayError = (err) => {
	console.log(`AdminController => Error: ${err}`);
};

module.exports.viewRestaurants = (req, res) => {
	RestaurantModel.find({}, {dishes: 0, cuisineType: 0})
		.exec()
		.then((data) => {
			return res.status(200).json({ restaurants: data });
		})
		.catch((err) => {
			displayError(err);
			return res.status(500).json({ message: "Server Error" });
		});
};

module.exports.addRestaurant = (req, res) => {
	/*
	1. Add Restaurant
	*/
	new RestaurantModel(req.body.restaurant)
		.save()
		.then((data) => {
			return res
				.status(200)
				.json({ data, message: "Restaurant added to database!" });
		})
		.catch((err) => {
			displayError(err);
			return res.status(500).json({ message: "Server Error" });
		});
};

module.exports.removeRestaurant = (req, res) => {
	/*
	1. Delete from Customer's ordered list
	2. Delete all orders placed at that restaurant
	2. Delete all dishes
	3. Delete Restaurant
	*/
	const id = req.body.restaurantId;
	OrderModel.find({ restaurantId: id })
		.exec()
		.then((orders) => {
			let promises = [];
			for (const order of orders) {
				promises.push(
					CustomerModel.findByIdAndUpdate(order.customerId, {
						$pull: { orders: order["_id"] },
					}).exec()
				);
			}
			return Promise.all(promises);
		})
		.then((data) => {
			console.log(
				"Removed orders from customers of restaurant to be deleted",
				data
			);
			return OrderModel.deleteMany({ restaurantId: id }).exec();
		})
		.then((data) => {
			console.log(
				"Deleted all orders placed at restaurant to be deleted",
				data
			);
			return RestaurantModel.findById(id, { dishes: 1 }).exec();
		})
		.then((data) => {
			console.log("Deleting dishes...", data.dishes);
			let promises = [];
			for (const dishId of data.dishes) {
				promises.push(DishModel.findByIdAndDelete(dishId).exec());
			}
			return Promise.all(promises);
		})
		.then((data) => {
			console.log("Dishes deleted!", data);
			return RestaurantModel.findByIdAndDelete(id).exec();
		})
		.then((data) => {
			console.log("Restaurant Deleted", data);
			return res.status(200).json({ message: "Deleted restaurant" });
		})
		.catch((err) => {
			displayError(err);
			return res.status(500).json({ message: "Server Error" });
		});
};

module.exports.getDishes = (req, res) => {
	const restaurantId = req.query.id;
	RestaurantModel.findById(restaurantId, { dishes: 1 })
		.populate("dishes")
		.exec()
		.then((restaurant) => {
			return res
				.status(200)
				.json({ restaurantId: restaurant["_id"], dishes: restaurant.dishes });
		})
		.catch((err) => {
			displayError(err);
			return res.status(500).json({ message: "Server Error" });
		});
};

module.exports.addDish = (req, res) => {
	/*
	1. Create new dish and Save it
	2. Add to restaurant's dish list
	*/
	const { restaurantId, image, name, price, offer } = req.body;
	new DishModel({ image, name, price, offer })
		.save()
		.then((dish) => {
			console.log("New dish created", dish);
			return RestaurantModel.findByIdAndUpdate(restaurantId, {
				$push: { dishes: dish["_id"] },
			}).exec();
		})
		.then((data) => {
			console.log("New dish added to restaurant", data);
			return res
				.status(200)
				.json({ data, message: "New dish added to restaurant" });
		})
		.catch((err) => {
			displayError(err);
			return res.status(500).json({ message: "Server Error" });
		});
};

module.exports.removeDish = (req, res) => {
	/*
	1. Delete it from restaurants list of dishes
	2. Deleted orders from Customers orders
	3. Delete all orders with that dish
	4. Delete list from database
	*/
	const { restaurantId, dishId } = req.body;
	RestaurantModel.findByIdAndUpdate(restaurantId, { $pull: { dishes: dishId } })
		.exec()
		.then((data) => {
			console.log("Deleted dish from restaurant", data);
			return OrderModel.find({ dishId }).exec();
		})
		.then((orders) => {
			let promises = [];
			for (const order of orders) {
				promises.push(
					CustomerModel.findByIdAndUpdate(order.customerId, {
						$pull: { orders: order["_id"] },
					}).exec()
				);
			}
			return Promise.all(promises);
		})
		.then((data) => {
			console.log("Deleted orders from Customers orders", data);
			return OrderModel.deleteMany({ dishId }).exec();
		})
		.then((data) => {
			console.log("Deleted all orders with the specified dish id", data);
			return DishModel.findByIdAndDelete(dishId).exec();
		})
		.then((data) => {
			console.log("Deleted dish from database", data);
			return res
				.status(200)
				.json({ data, message: "Deleted dish for Database!" });
		})
		.catch((err) => {
			displayError(err);
			return res.status(500).json({ message: "Server Error" });
		});
};

module.exports.viewOrders = (req, res) => {
	/*
	1. Find all orders
	*/
	OrderModel.find({})
		.exec()
		.then((data) => {
			return res.status(200).json({ orders: data, message: "Success" });
		})
		.catch((err) => {
			displayError(err);
			return res.status(500).json({ message: "Server Error" });
		});
};

module.exports.removeOrder = (req, res) => {
	/*
	1. Find customer id from order id
	2. Delete from order list of customer
	3. Delete order
	*/
	const orderId = req.body.orderId;
	OrderModel.findById(orderId, { customerId: 1 })
		.exec()
		.then((customer) => {
			console.log("Customer who placed order", customer);
			return CustomerModel.findByIdAndUpdate(customer.customerId, {
				$pull: { orders: orderId },
			}).exec();
		})
		.then((data) => {
			console.log("Deleted order from customer", data);
			return OrderModel.findByIdAndDelete(orderId).exec();
		})
		.then((data) => {
			console.log("Deleted order", data);
			return res.status(200).json({ message: "Deleted order" });
		})
		.catch((err) => {
			displayError(err);
			return res.status(500).json({ message: "Server Error" });
		});
};
