const express = require("express");
const router = express.Router();
const authenticate = require("../util/authenticate");
const Controller = require("../controllers/payment");
const permit = require("../util/permission");
const validator = require("express-joi-validation").createValidator({});
const {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
} = require("../validators/payment");

router.use(authenticate);

const permitAdd = permit("payment", ["create"]);
router.post("/", permitAdd, validator.body(createSchema), Controller.addNew);

const permitReadAll = permit("payment", ["readAll"]);
router.get("/all", permitReadAll, validator.query(findAll), Controller.findAll);

const permitUpdate = permit("payment", ["update"]);
router.put(
  "/:id",
  permitUpdate,
  validator.params(updateSchema),
  Controller.updateOne
);

const permitDelete = permit("payment", ["delete"]);
router.delete(
  "/:id",
  permitDelete,
  validator.params(deleteSchema),
  Controller.deleteOne
);

const permitFindOne = permit("payment", ["read"]);
router.get(
  "/:id",
  permitFindOne,
  validator.params(readSchema),
  Controller.findOne
);

module.exports = router;
