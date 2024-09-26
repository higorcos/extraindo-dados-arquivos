const express = require("express");
const routes = express.Router();

const folhaPagamentosRoutes = require("./routes/folhaPagamentosRoutes");
const usersRoutes = require("./routes/usersRoutes");

routes.use("/folha",folhaPagamentosRoutes);
routes.use("/user",usersRoutes);

module.exports = routes; 