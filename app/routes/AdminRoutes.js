const { AdminController } = require("../controllers");
const { authMiddleware } = require("../middlewares");

module.exports = (app) => {
	app.get(
		"/api/viewRestaurants",
		[authMiddleware.verifyToken, authMiddleware.isAdmin],
		AdminController.viewRestaurants
	);
	app.post(
		"/api/addRestaurant",
		[authMiddleware.verifyToken, authMiddleware.isAdmin],
		AdminController.addRestaurant
	);
	app.delete(
		"/api/removeRestaurant",
		[authMiddleware.verifyToken, authMiddleware.isAdmin],
		AdminController.removeRestaurant
	);
	app.get(
		"/api/getDishes",
		[authMiddleware.verifyToken, authMiddleware.isAdmin],
		AdminController.getDishes
	);
	app.post(
		"/api/addDish",
		[authMiddleware.verifyToken, authMiddleware.isAdmin],
		AdminController.addDish
	);
	app.delete(
		"/api/removeDish",
		[authMiddleware.verifyToken, authMiddleware.isAdmin],
		AdminController.removeDish
	);
	app.get(
		"/api/viewOrders",
		[authMiddleware.verifyToken, authMiddleware.isAdmin],
		AdminController.viewOrders
	);
	app.get(
		"/api/viewPendingOrders",
		[authMiddleware.verifyToken, authMiddleware.isAdmin],
		AdminController.viewPendingOrders
	);
	app.delete(
		"/api/removeOrder",
		[authMiddleware.verifyToken, authMiddleware.isAdmin],
		AdminController.removeOrder
	);
	app.post(
		"/api/approveOrder",
		[authMiddleware.verifyToken, authMiddleware.isAdmin],
		AdminController.approveOrder
	);
};
