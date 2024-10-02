const express = require("express");
const routes = express.Router();
const othersControllers = require("../controllers/othersControllers");

routes.get("/", othersControllers.list);

module.exports = routes;  