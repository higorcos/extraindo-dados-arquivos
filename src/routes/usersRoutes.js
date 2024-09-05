const express = require("express");
const routes = express.Router();
const usersControllers = require("../controllers/usersControllers");
const {verifyJWT: middlewareAuth} = require("../middleware/auth"); //middleware


routes.post("/login", usersControllers.login);
routes.post("/authorization", usersControllers.authorization);

module.exports = routes; 