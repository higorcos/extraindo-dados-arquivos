const express = require("express");
const routes = express.Router();
const multer = require('multer');
const multerConfig = multer();     
const folhaPagamentosControllers = require("../controllers/folhaPagamentosControllers");

routes.post("/test", multerConfig.single("file"), folhaPagamentosControllers.insert);
routes.post("/juntarCSV", multerConfig.array("file"), folhaPagamentosControllers.joinCSV);
routes.get("/", folhaPagamentosControllers.show);
routes.get("/listagem", folhaPagamentosControllers.list);

module.exports = routes;