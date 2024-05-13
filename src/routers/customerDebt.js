const express = require("express");
const router = express.Router();
const authenticate = require("../util/authenticate");
const Controller = require("../controllers/customerDebt");
const permit = require("../util/permission");
const validator = require("express-joi-validation").createValidator({});
const {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
} = require("../validators/customerDebt");

router.use(authenticate);

const permitAdd = permit("customerDebt", ["create"]);
router.post("/", permitAdd, validator.body(createSchema), Controller.addNew);

const permitReadAll = permit("customerDebt", ["readAll"]);
router.get("/all", permitReadAll, validator.query(findAll), Controller.findAll);

const permitUpdate = permit("customerDebt", ["update"]);
router.put(
  "/:id",
  permitUpdate,
  validator.params(updateSchema),
  Controller.updateOne
);

const permitDelete = permit("customerDebt", ["delete"]);
router.delete(
  "/:id",
  permitDelete,
  validator.params(deleteSchema),
  Controller.deleteOne
);

const permitFindOne = permit("customerDebt", ["read"]);
router.get(
  "/:id",
  permitFindOne,
  validator.params(readSchema),
  Controller.findOne
);

module.exports = router;
