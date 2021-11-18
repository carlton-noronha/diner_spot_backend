require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const { RoleModel } = require("./app/models");

const app = express();
const PORT = process.env.PORT || 8271;

app.use(
	cors({
		origin: "http://localhost:3000",
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
	.connect("mongodb://localhost/dinnerspot")
	.then(() => {
		console.log("Successfully connected to the database");
		createRoles();
	})
	.catch((err) => console.log(`Server => Error: ${err}`));

function createRoles() {
	RoleModel.estimatedDocumentCount()
		.exec()
		.then((count) => {
			if (!count) {
				new RoleModel({ type: "User" })
					.save()
					.then((data) => console.log("Successfully created User role"))
					.catch((err) => console.log("Error creating User role."));

				new RoleModel({ type: "Admin" })
					.save()
					.then((data) => console.log("Successfully created Admin role"))
					.catch((err) => console.log("Error creating Admin role."));
			}
		})
		.catch((err) => console.log("Error creating roles: " + err));
}

require("./app/routes/UserRoutes")(app);
require("./app/routes/AdminRoutes")(app);
require("./app/routes/AuthRoutes")(app);

app.listen(PORT, () => {
	console.log(`Running on port: ${PORT}`);
});
