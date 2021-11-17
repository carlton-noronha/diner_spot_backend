const { AuthController } = require("../controllers");
const { verifySignUpMiddleware } = require("../middlewares");

module.exports = (app) => {
	app.post(
		"/api/auth/signup",
		verifySignUpMiddleware.checkDuplicateEmail,
		AuthController.signup
	);
	app.post("/api/auth/signin", AuthController.signin);
};
