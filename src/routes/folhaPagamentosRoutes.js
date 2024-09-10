const express = require("express");
const routes = express.Router();
const multer = require('multer');
const multerConfig = multer();     
const folhaPagamentosControllers = require("../controllers/folhaPagamentosControllers");
const {verifyJWT: middlewareAuth} = require("../middleware/auth"); //middleware

routes.post("/test/:idPortal", multerConfig.fields([
    { name: 'file', maxCount: 1 },  
    { name: 'fileRubricas', maxCount: 1 } 
]), folhaPagamentosControllers.insert);
routes.post("/juntarCSV", multerConfig.array("file"), folhaPagamentosControllers.joinCSV);
routes.get("/", folhaPagamentosControllers.show);
routes.get("/listagem", middlewareAuth , folhaPagamentosControllers.list);

module.exports = routes;