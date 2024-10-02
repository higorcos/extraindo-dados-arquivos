const express = require("express");
const routes = express.Router();
const othersControllers = require("../controllers/othersControllers");

routes.get("/list", othersControllers.list);

module.exports = routes;  