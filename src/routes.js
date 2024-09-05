const express = require("express");
const routes = express.Router();

const folhaPagamentosRoutes = require("./routes/folhaPagamentosRoutes");


routes.use(folhaPagamentosRoutes);
module.exports = routes; 