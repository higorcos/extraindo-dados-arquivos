const { Router } = require('express')
const multer = require('multer')

const multerConfig = multer();
const routes = Router();

routes.post("/products", multerConfig.single("file"),( request, response)=>{
    console.log(request.file);
    return response.send();
})
routes.get("/", ( request, response)=>{
    console.log('a')
    return response.send();
})
module.exports = routes