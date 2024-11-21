const express = require("express");
const routes = express.Router();
const multer = require('multer');
const multerConfig = multer();     
const folhaPagamentosControllers = require("../controllers/folhaPagamentosControllers");
const {verifyJWT: middlewareAuth} = require("../middleware/auth"); //middleware
 
routes.post("/:idPortal", multerConfig.fields([
    { name: 'fileFolha', maxCount: 1 },  
    { name: 'fileRubricas', maxCount: 1 },
    { name: 'fileHistoricoXML', maxCount: 1 },  
    { name: 'fileCadastrosXML', maxCount: 1 },  
]), folhaPagamentosControllers.insert);
routes.post("/juntarCSV", multerConfig.array("file"), folhaPagamentosControllers.joinCSV);
routes.get("/:idPortal", folhaPagamentosControllers.listAll);
routes.get("/:idPortal/listAll",  folhaPagamentosControllers.listAll);
routes.get("/:idPortal/listAllAndNotDisplayed",  folhaPagamentosControllers.listAllAndNotDisplayed);
routes.delete("/:idPortal/:month/:year",  folhaPagamentosControllers.delete);

routes.get("/:idPortal/searchByPeriod/:month/:year",  folhaPagamentosControllers.searchByPeriod);
routes.get("/:idPortal/searchByPeriodAndTables/:month/:year",  folhaPagamentosControllers.searchByPeriodAndTables);
routes.get("/:idPortal/showPeriods",  folhaPagamentosControllers.showPeriods);
routes.get("/:idPortal/allPeriods",  folhaPagamentosControllers.allPeriods);
routes.get("/:idPortal/searchByPeriodAndNotDisplayed/:month/:year",  folhaPagamentosControllers.searchByPeriodAndNotDisplayed);

routes.put("/:idPortal/changeView/:month/:year/:view",  folhaPagamentosControllers.changeView);

module.exports = routes;