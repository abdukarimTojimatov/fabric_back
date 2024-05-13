const express = require("express");
const router = express.Router();
const authenticate = require("../util/authenticate");
const Controller = require("../controllers/user");
const permit = require("../util/permission");
const validator = require("express-joi-validation").createValidator({});
const {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
} = require("../validators/user");

const { uploadAvatar } = require("../util/avatar-upload");

//router.use(authenticate);
//
const permitAdd = permit("user", ["create"]);
router.route("/").post(
  // permitAdd,
  uploadAvatar,
  validator.body(createSchema),
  Controller.addNew
);

//
const permitReadAll = permit("user", ["readAll"]);
router.route("/all").post(
  //permitReadAll,
  validator.body(findAll),
  Controller.findAll
);
//
const permitUpdate = permit("user", ["update"]);
router.route("/:id").put(
  // permitUpdate,
  uploadAvatar,
  validator.params(updateSchema),
  Controller.updateOne
);
//
const permitDelete = permit("user", ["delete"]);
router.route("/:id").delete(
  // permitDelete,
  validator.params(deleteSchema),
  Controller.deleteOne
);
//
const permitFindOne = permit("user", ["read"]);
router.route("/:id").get(
  //permitFindOne,
  validator.params(readSchema),
  Controller.findOne
);

module.exports = router;
