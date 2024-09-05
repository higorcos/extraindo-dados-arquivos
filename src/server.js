const bodyParser = require('body-parser')
const routes = require("./routes")
const express = require("express")
const cors = require('cors');
require("dotenv").config();
const app = express()




//cors
app.use(
    cors({
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      origin: "*",
      allowedHeaders: "*",
    })
  ); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(routes);

app.listen(process.env.PORT_SERVER,() => {
    console.log(`\n\tServidor online !!! \n\tPorta: ${process.env.PORT_SERVER} \n\tModo: ${
      process.env.NODE_ENV
    }\n`)
});