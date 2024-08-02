var routes = require("./routes")
var express = require("express")
var app = express()

/*
const cors = require('cors');

//cors
app.use(
    cors({
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      origin: "*",
      allowedHeaders: "*",
    })
  );
*/
var bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(routes);

app.listen(3003,() => {
    console.log("Servidor rodando")
});