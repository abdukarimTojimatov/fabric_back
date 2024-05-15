const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { ErrorHandler } = require("../util/error");

module.exports = {
  login: async function (req, res, next) {
    try {
      const doc = await User.findOne({
        phone: req.body?.phone,
        employmentStatus: "active",
      }).exec();

      if (!doc)
        return res
          .status(404)
          .json({ code: "A112", message: "user not found" });

      if (doc.password === req.body?.password) {
        const token = jwt.sign(
          {
            _id: doc?._id,
            title: {
              username: doc?.profile.username,
            },
            role: doc?.role,
          },
          process.env.TOKEN_SECRET_KEY,
          { algorithm: "HS256", expiresIn: process.env.TOKEN_EXPIRESIN }
        );

        return res.status(200).json({ token });
      }

      return res
        .status(403)
        .json({ code: "A113", message: "phone and password don't match" });
    } catch (err) {
      return next(new ErrorHandler(403, "Forbidden access", "E114"));
    }
  },
};
