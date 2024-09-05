const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET_TOKEN;


module.exports = {
  verifyJWT: (req, res, next) => {
    const token = req.headers["x-access-token"];
    if (!token) {
      
      return res
        .status(401)
        .json({ auth: false, message: "No token provided." });
    }
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {
        
        return res
          .status(401)
          .json({ auth: false, message: "Failed to authenticate token." });
      } else {
      }
      req.userId = decoded.userId;
      next();
    });
  },
};