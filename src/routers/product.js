const express = require("express");
const router = express.Router();
const authenticate = require("../util/authenticate");
const Controller = require("../controllers/product");
const permit = require("../util/permission");
const validator = require("express-joi-validation").createValidator({});
const {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
} = require("../validators/product");

router.use(authenticate);

const permitAdd = permit("product", ["create"]);
router.post("/", permitAdd, validator.body(createSchema), Controller.addNew);

const permitReadAll = permit("product", ["readAll"]);
router.post("/all", permitReadAll, validator.body(findAll), Controller.findAll);

const permitUpdate = permit("product", ["update"]);
router.put(
  "/:id",
  permitUpdate,
  validator.params(updateSchema),
  Controller.updateOne
);

const permitDelete = permit("product", ["delete"]);
router.delete(
  "/:id",
  permitDelete,
  validator.params(deleteSchema),
  Controller.deleteOne
);

const permitFindOne = permit("product", ["read"]);
router.get(
  "/:id",
  permitFindOne,
  validator.params(readSchema),
  Controller.findOne
);

module.exports = router;
