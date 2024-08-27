const bodyParser = require('body-parser')
const routes = require("./routes")
const express = require("express")
const cors = require('cors');
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

app.listen(3003,() => {
    console.log("Servidor rodando")
});