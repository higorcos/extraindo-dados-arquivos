const express = require("express");
const routes = express.Router();
const othersControllers = require("../controllers/othersControllers");

routes.get("/", othersControllers.list);
routes.get("/teste-timeout", (req,res)=>{
    setTimeout(() => {
        res.send('Resposta atrasada em 4 minutos.');
    }, 240000); // 10 segundos
});

module.exports = routes;  