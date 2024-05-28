const express = require("express");
const router = express.Router();
const authenticate = require("../util/authenticate");
const Controller = require("../controllers/expenceCategory");
const permit = require("../util/permission");
const validator = require("express-joi-validation").createValidator({});
const {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
} = require("../validators/expenceCategory");

router.use(authenticate);

const permitAdd = permit("expenseCategory", ["create"]);
router.post("/", permitAdd, validator.body(createSchema), Controller.addNew);

const permitReadAll = permit("expenseCategory", ["readAll"]);
router.post(
  "/all",
  permitReadAll,
  validator.query(findAll),
  Controller.findAll
);

const permitUpdate = permit("expenseCategory", ["update"]);
router.put(
  "/:id",
  permitUpdate,
  validator.params(updateSchema),
  Controller.updateOne
);

const permitDelete = permit("expenseCategory", ["delete"]);
router.delete(
  "/:id",
  permitDelete,
  validator.params(deleteSchema),
  Controller.deleteOne
);

const permitFindOne = permit("expenseCategory", ["read"]);
router.get(
  "/:id",
  permitFindOne,
  validator.params(readSchema),
  Controller.findOne
);

module.exports = router;
