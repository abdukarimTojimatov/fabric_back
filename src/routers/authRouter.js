const express = require("express");
const router = express.Router();
const Controller = require("../controllers/auth");
const validator = require("express-joi-validation").createValidator({});
const { authValidator } = require("../validators/auth");

router.route("/").post(validator.body(authValidator), Controller.login);

module.exports = router;
