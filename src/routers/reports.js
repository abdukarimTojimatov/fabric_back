const express = require("express");
const router = express.Router();
const authenticate = require("../util/authenticate");
const Controller = require("../controllers/reports");
const permit = require("../util/permission");
const validator = require("express-joi-validation").createValidator({});
const {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
} = require("../validators/customer");

router.route("/reportMonthly").post(Controller.reportMonthly);
router.route("/reportYearly").post(Controller.reportYearly);
router.route("/reportAllYears").post(Controller.reportAllYears);

module.exports = router;
