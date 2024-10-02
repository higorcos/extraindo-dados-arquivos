const express = require("express");
const routes = express.Router();

const folhaPagamentosRoutes = require("./routes/folhaPagamentosRoutes");
const usersRoutes = require("./routes/usersRoutes");
const othersRoutes = require("./routes/othersRoutes");

routes.use("/folha",folhaPagamentosRoutes);
routes.use("/user",usersRoutes);
routes.use("/portais",othersRoutes); 

module.exports = routes;   