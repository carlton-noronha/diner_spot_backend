const { UserController } = require("../controllers");
const { authMiddleware } = require("../middlewares");
module.exports = (app) => {
	app.get(
		"/api/viewDishes",
		authMiddleware.verifyToken,
		UserController.viewDishes
	);
	app.post(
		"/api/addToMyOrders",
		authMiddleware.verifyToken,
		UserController.addToMyOrders
	);
	app.get(
		"/api/ordersCount",
		authMiddleware.verifyToken,
		UserController.ordersCount
	);
	app.get(
		"/api/viewMyOrders",
		authMiddleware.verifyToken,
		UserController.viewMyOrders
	);
	app.get(
		"/api/dishesCount",
		authMiddleware.verifyToken,
		UserController.dishesCount
	);
};
