const express = require("express");
const router = express.Router();
const authenticate = require("../util/authenticate");
const Controller = require("../controllers/salesOrder");
const permit = require("../util/permission");

router.use(authenticate);

const permitAdd = permit("salesOrder", ["create"]);
router.route("/").post(permitAdd, Controller.addNew);

const permitReadAll = permit("salesOrder", ["readAll"]);
router.route("/all").post(permitReadAll, Controller.findAll);

const permitUpdate = permit("salesOrder", ["update"]);
router.route("/:id").put(permitUpdate, Controller.updateOne);

router.route("/updatePayment/:id").put(permitUpdate, Controller.updatePayment);

const permitDelete = permit("salesOrder", ["delete"]);
router.route("/:id").delete(permitDelete, Controller.deleteOne);

const permitFindOne = permit("salesOrder", ["read"]);
router.route("/:id").get(permitFindOne, Controller.findOne);

const permitFindALl = permit("salesOrder", ["read"]);
router
  .route("/allItems")
  .post(permitFindALl, Controller.findAllSalesOrderItems);

const permitUpdateDiscount = permit("salesOrder", ["update"]);
router
  .route("/discount")
  .post(permitUpdateDiscount, Controller.applyDiscountToSalesOrder);

module.exports = router;
