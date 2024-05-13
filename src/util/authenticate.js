const jwt = require("jsonwebtoken");
const { ErrorHandler } = require("./error");
const User = require("../models/user");

module.exports = async function (req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (bearerHeader) {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];

      // Check if token exists
      if (!bearerToken) {
        return next(
          new ErrorHandler(403, "Error: Token not provided", "MA104")
        );
      }

      // Verify the token
      const decoded = jwt.verify(bearerToken, process.env.TOKEN_SECRET_KEY);

      // Check if token is valid
      if (!decoded) {
        return next(
          new ErrorHandler(403, "Error: Token is not valid", "MA100")
        );
      }

      // Check if user exists
      const userActive = await User.findById(decoded._id).exec();
      if (!userActive) {
        return next(
          new ErrorHandler(403, "Error: Authorized user not found", "MA101")
        );
      }

      req.user = decoded;
      return next();
    } catch (error) {
      return next(
        new ErrorHandler(
          403,
          `Error: Authorization failed - ${error.message}`,
          "MA102"
        )
      );
    }
  } else {
    return next(new ErrorHandler(403, "Error: Not authorized", "MA103"));
  }
};
