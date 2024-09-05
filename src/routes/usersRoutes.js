const express = require("express");
const routes = express.Router();
const usersControllers = require("../controllers/usersControllers");

routes.post("/login", usersControllers.login);
routes.post("/login-authorization", usersControllers.authorization);

module.exports = routes; 