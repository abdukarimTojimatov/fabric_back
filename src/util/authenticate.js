const jwt = require("jsonwebtoken");
const util = require("util");
const { ErrorHandler } = require("./error");
const User = require("../models/user");

const verifyAsync = util.promisify(jwt.verify);

module.exports = async function (req, res, next) {
  try {
    const bearerHeader = req.headers["authorization"];

    if (!bearerHeader) {
      throw new ErrorHandler(403, "Error: Not authorized", "MA103");
    }

    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];

    const decoded = await verifyAsync(
      bearerToken,
      process.env.TOKEN_SECRET_KEY
    );

    if (!decoded) {
      throw new ErrorHandler(403, "Error: Token is not valid", "MA100");
    }

    const userActive = await User.findById(decoded._id).exec();

    if (!userActive || userActive.employmentStatus !== "active") {
      throw new ErrorHandler(403, "Error: Token is not valid", "MA101");
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
};
