require("dotenv").config();
let options;

if(process.env.NODE_ENV === 'production'){
  options = {
    host: process.env.FIREBIRD_HOST,
    port: process.env.FIREBIRD_PORT,
    database: process.env.FIREBIRD_DATABASE,
    user: process.env.FIREBIRD_USER, 
    password: process.env.FIREBIRD_PASSWORD,
  };
}else{
  options = {
    host: process.env.DEV_FIREBIRD_HOST,
    port: process.env.DEV_FIREBIRD_PORT,
    database: process.env.DEV_FIREBIRD_DATABASE,
    user: process.env.DEV_FIREBIRD_USER, 
    password: process.env.DEV_FIREBIRD_PASSWORD,
  }; 
}
  
module.exports = options; 