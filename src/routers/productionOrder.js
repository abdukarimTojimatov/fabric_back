const express = require("express");
const router = express.Router();
const authenticate = require("../util/authenticate");
const Controller = require("../controllers/productionOrder");
const permit = require("../util/permission");
const validator = require("express-joi-validation").createValidator({});
const {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
} = require("../validators/productionOrder");

router.use(authenticate);

const permitAdd = permit("productionOrder", ["create"]);
router
  .route("/")
  .post(permitAdd, validator.body(createSchema), Controller.addNew);

const permitReadAll = permit("productionOrder", ["readAll"]);
router
  .route("/all")
  .post(permitReadAll, validator.query(findAll), Controller.findAll);

const permitUpdate = permit("productionOrder", ["update"]);
router
  .route("/:id")
  .put(permitUpdate, validator.params(updateSchema), Controller.updateOne);

const permitDelete = permit("productionOrder", ["delete"]);
router
  .route("/:id")
  .delete(permitDelete, validator.params(deleteSchema), Controller.deleteOne);

const permitFindOne = permit("productionOrder", ["read"]);
router
  .route("/:id")
  .get(permitFindOne, validator.params(readSchema), Controller.findOne);

module.exports = router;
