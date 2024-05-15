const jwt = require("jsonwebtoken");
const { ErrorHandler } = require("./error");
const bluebird = require("bluebird");
bluebird.promisifyAll(jwt);
const User = require("../models/user");

module.exports = async function (req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader) {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      const decoded = await jwt.verifyAsync(
        bearerToken,
        process.env.TOKEN_SECRET_KEY
      );
      if (!decoded)
        return next(
          new ErrorHandler(403, "Error: Token is not valid", "MA100")
        );

      const userActive = await User.findById(decoded._id).exec();

      if (userActive?.employmentStatus == "active") {
        req.user = decoded;
        return next();
      } else {
        return next(
          new ErrorHandler(403, "Error: Token is not valid", "MA101")
        );
      }
    } catch (error) {
      return next(
        new ErrorHandler(403, "Error: Authorization failed", "MA102")
      );
    }
  } else {
    return next(new ErrorHandler(403, "Error: Not authorized", "MA103"));
  }
};
