const express = require("express");
const router = express.Router();
const authenticate = require("../util/authenticate");
const Controller = require("../controllers/rawWaste");
const permit = require("../util/permission");
const validator = require("express-joi-validation").createValidator({});
const {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
} = require("../validators/rawWaste");

router.use(authenticate);

const permitAdd = permit("rawWaste", ["create"]);
router
  .route("/")
  .post(permitAdd, validator.body(createSchema), Controller.addNew);

const permitReadAll = permit("rawWaste", ["readAll"]);
router
  .route("/all")
  .post(permitReadAll, validator.body(findAll), Controller.findAll);

const permitUpdate = permit("rawWaste", ["update"]);
router
  .route("/:id")
  .put(permitUpdate, validator.params(updateSchema), Controller.updateOne);

const permitDelete = permit("rawWaste", ["delete"]);
router
  .route("/:id")
  .delete(permitDelete, validator.params(deleteSchema), Controller.deleteOne);

const permitFindOne = permit("rawWaste", ["read"]);
router
  .route("/:id")
  .get(permitFindOne, validator.params(readSchema), Controller.findOne);

module.exports = router;
