const fs = require("fs");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});
const { ErrorHandler } = require("./error");
const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/user");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Please upload only icon !", false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadFiles = upload.single("avatar");
const uploadFile = upload.single("logo");

exports.uploadAvatar = (req, res, next) => {
  uploadFiles(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return next(
          new ErrorHandler(400, "Too many files to upload !", "AV100")
        );
      }
    } else if (err) {
      return next(new ErrorHandler(400, "UploadAvatars " + err, "AV101"));
    }
    next();
  });
};

exports.reqizeAvatar = async (req, res, next) => {
  if (!req.file) return next();

  const value = Date.now();
  const newFilename = `${value}.jpg`;

  const folderPath = `${process.env.FILEPATH}uploads`;
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  if (!fs.existsSync(`${process.env.FILEPATH}uploads/avatar`)) {
    fs.mkdirSync(`${process.env.FILEPATH}uploads/avatar`, {
      recursive: true,
    });
  }

  await sharp(req.file.buffer)
    .png()
    .toFile(`${process.env.FILEPATH}uploads/avatar/${newFilename}`);

  req.body.avatar =
    `${req.protocol}://${req.get("host")}` == "http://89.249.62.62:3009"
      ? `https://support.premiumsoft.uz/files/avatar/${newFilename}`
      : `${req.protocol}://${req.get("host")}/files/avatar/${newFilename}`;

  next();
};
exports.uploadLogo = (req, res, next) => {
  uploadFile(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return next(
          new ErrorHandler(400, "Too many files to upload !", "AV100")
        );
      }
    } else if (err) {
      return next(new ErrorHandler(400, "UploadLogo " + err, "AV101"));
    }
    next();
  });
};

exports.reqizeLogo = async (req, res, next) => {
  if (!req.file) return next();

  const value = Date.now();
  const newFilename = `${value}.jpg`;

  const folderPath = `${process.env.FILEPATH}uploads`;
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  if (!fs.existsSync(`${process.env.FILEPATH}uploads/logo`)) {
    fs.mkdirSync(`${process.env.FILEPATH}uploads/logo`, {
      recursive: true,
    });
  }

  await sharp(req.file.buffer)
    .png()
    .toFile(`${process.env.FILEPATH}uploads/logo/${newFilename}`);

  req.body.logo =
    `${req.protocol}://${req.get("host")}` == "http://89.249.62.62:3009"
      ? `https://support.premiumsoft.uz/files/logo/${newFilename}`
      : `${req.protocol}://${req.get("host")}/files/logo/${newFilename}`;

  next();
};
