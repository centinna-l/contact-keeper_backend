const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
  //get token from the header
  const token = req.header("x-auth-token");
  //Check if not token
  if (!token) {
    return res.status(401).json({
      msg: "Permission Denied",
    });
  }
  try {
    const decoded = jwt.verify(token, config.get("jwtsecrete"));
    req.user = decoded.user;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).json({
      msg: "Permission Denied",
    });
  }
};
