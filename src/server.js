var routes = require("./routes")
var express = require("express")
var app = express()

/*var bodyParser = require('body-parser')
const cors = require('cors');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
//cors
app.use(
    cors({
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      origin: "*",
      allowedHeaders: "*",
    })
  );
*/
app.use(routes);

app.listen(3003,() => {
    console.log("Servidor rodando")
});