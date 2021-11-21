const {
	RestaurantModel,
	DishModel,
	OrderModel,
	CustomerModel,
	PendingOrderModel,
} = require("../models");

const displayError = (err) => {
	console.log(`AdminController => Error: ${err}`);
};

module.exports.viewRestaurants = (req, res) => {
	RestaurantModel.find({})
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

module.exports.updateRestaurant = (req, res) => {
	RestaurantModel.findByIdAndUpdate(req.body.id, req.body.restaurant)
		.exec()
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
	2. Delete pending and all orders placed at that restaurant
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
			return PendingOrderModel.deleteMany({ restaurantId: id }).exec();
		})
		.then((data) => {
			console.log("Deleted pending orders", data);
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
	RestaurantModel.findById(restaurantId, { name: 1, location: 1, dishes: 1 })
		.populate("dishes")
		.exec()
		.then((restaurant) => {
			return res.status(200).json({
				restaurantId: restaurant["_id"],
				restaurantName: restaurant["name"],
				restaurantLocation: restaurant["location"],
				dishes: restaurant.dishes,
			});
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
			return res.status(200).json({
				data: data.dishes[data.dishes.length - 1],
				message: "New dish added to restaurant",
			});
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
			return PendingOrderModel.deleteMany({ dishId }).exec();
		})
		.then((data) => {
			console.log("Deleted from pending orders", data);
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
		.populate("restaurantId")
		.populate("dishId")
		.populate("customerId")
		.exec()
		.then((data) => {
			return res.status(200).json({ orders: data, message: "Success" });
		})
		.catch((err) => {
			displayError(err);
			return res.status(500).json({ message: "Server Error" });
		});
};

module.exports.viewPendingOrders = (req, res) => {
	/*
	1. Find all orders
	*/
	PendingOrderModel.find({})
		.populate("restaurantId")
		.populate("dishId")
		.populate("customerId")
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
	1. Find in pending orders and delete
	*/
	const orderId = req.body.orderId;
	PendingOrderModel.findByIdAndDelete(orderId)
		.exec()
		.then((data) => {
			console.log("Deleted order", data);
			return res.status(200).json({ message: "Deleted order" });
		})
		.catch((err) => {
			displayError(err);
			return res.status(500).json({ message: "Server Error" });
		});
};

module.exports.approveOrder = (req, res) => {
	const orderId = req.body.orderId;
	PendingOrderModel.findById(orderId)
		.exec()
		.then((order) => {
			const buildOrder = {
				customerId: order.customerId,
				restaurantId: order.restaurantId,
				dishId: order.dishId,
				quantity: order.quantity,
				amountPaid: order.amountPaid,
			};
			return new OrderModel(buildOrder).save();
		})
		.then((order) => {
			console.log("Order approved", order);
			return CustomerModel.findByIdAndUpdate(order["customerId"], {
				$push: { orders: order["_id"] },
			}).exec();
		})
		.then((customer) => {
			console.log("Order added to requested customers list", customer);
			return PendingOrderModel.findByIdAndDelete(orderId).exec();
		})
		.then((order) => {
			console.log("Deleted from pending order", order);
			return res.status(200).json({ message: "Sucess" });
		})
		.catch((err) => {
			displayError(err);
			return res.status(500).json({ message: "Server Error" });
		});
};
