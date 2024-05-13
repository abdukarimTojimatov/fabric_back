const express = require("express");
const router = express.Router();
const authenticate = require("../util/authenticate");
const Controller = require("../controllers/salesOrderItem");
const permit = require("../util/permission");
const validator = require("express-joi-validation").createValidator({});
const {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
} = require("../validators/salesOrderItem");

router.use(authenticate);

const permitAdd = permit("salesOrderItem", ["create"]);
router
  .route("/")
  .post(permitAdd, validator.body(createSchema), Controller.addNew);

const permitReadAll = permit("salesOrderItem", ["readAll"]);
router
  .route("/all")
  .get(permitReadAll, validator.query(findAll), Controller.findAll);

const permitUpdate = permit("salesOrderItem", ["update"]);
router
  .route("/:id")
  .put(permitUpdate, validator.params(updateSchema), Controller.updateOne);

const permitDelete = permit("salesOrderItem", ["delete"]);
router
  .route("/:id")
  .delete(permitDelete, validator.params(deleteSchema), Controller.deleteOne);

const permitFindOne = permit("salesOrderItem", ["read"]);
router
  .route("/:id")
  .get(permitFindOne, validator.params(readSchema), Controller.findOne);

module.exports = router;
