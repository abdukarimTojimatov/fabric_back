const express = require("express");
const router = express.Router();
const authenticate = require("../util/authenticate");
const Controller = require("../controllers/salary");
const permit = require("../util/permission");
const validator = require("express-joi-validation").createValidator({});
const {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
} = require("../validators/salary");

router.use(authenticate);

const permitAdd = permit("expense", ["create"]);
router.post("/", permitAdd, validator.body(createSchema), Controller.addNew);

const permitReadAll = permit("expense", ["readAll"]);
router.post(
  "/all",
  permitReadAll,
  validator.query(findAll),
  Controller.findAll
);

const permitUpdate = permit("expense", ["update"]);
router.put(
  "/:id",
  permitUpdate,
  validator.params(updateSchema),
  Controller.updateOne
);

const permitDelete = permit("expense", ["delete"]);
router.delete(
  "/:id",
  permitDelete,
  validator.params(deleteSchema),
  Controller.deleteOne
);

const permitFindOne = permit("expense", ["read"]);
router.get(
  "/:id",
  permitFindOne,
  validator.params(readSchema),
  Controller.findOne
);

module.exports = router;
