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

router.route("/daysInMonth").post(Controller.daysInMonth);
router.route("/monthsInYear").post(Controller.monthsInYear);
router.route("/wallet").get(Controller.getWallet);
router.route("/allYears").post(Controller.allYears);

module.exports = router;
