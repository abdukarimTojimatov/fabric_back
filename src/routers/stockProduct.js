const express = require("express");
const router = express.Router();
const authenticate = require("../util/authenticate");
const Controller = require("../controllers/stockProduct");
const permit = require("../util/permission");
const validator = require("express-joi-validation").createValidator({});
const {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
} = require("../validators/stockProduct");

router.use(authenticate);

const permitAdd = permit("stockProduct", ["create"]);
router
  .route("/")
  .post(permitAdd, validator.body(createSchema), Controller.addNew);

const permitReadAll = permit("stockProduct", ["readAll"]);
router
  .route("/all")
  .post(permitReadAll, validator.body(findAll), Controller.findAll);

const permitUpdate = permit("stockProduct", ["update"]);
router
  .route("/:id")
  .put(permitUpdate, validator.params(updateSchema), Controller.updateOne);

const permitDelete = permit("stockProduct", ["delete"]);
router
  .route("/:id")
  .delete(permitDelete, validator.params(deleteSchema), Controller.deleteOne);

const permitFindOne = permit("stockProduct", ["read"]);
router
  .route("/:id")
  .get(permitFindOne, validator.params(readSchema), Controller.findOne);

module.exports = router;
