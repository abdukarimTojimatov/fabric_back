const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

const express = require("express");
const mongoose = require("mongoose");
const debug = require("debug")("node-server:index");
const util = require("util");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const { ErrorHandler, handleError } = require("./util/error");
const winston = require("./util/winston.logger");
const appRouter = require("./router");
const fs = require("fs");

// main app
const app = express();

/// new commit
const PORT = process.env.PORT;

// mongoose
mongoose.connect(process.env.MONGO_HOST);

mongoose.connection.on("error", () => {
  throw new ErrorHandler(
    400,
    `Unable to connect to database: ${process.env.MONGO_HOST}`
  );
});

if (process.env.MONGOOSE_DEBUG) {
  mongoose.set("debug", (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}

// Logger
app.use(morgan("combined", { stream: winston.stream }));

// security setup
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
    parameterLimit: 50000,
  })
);

const imageRes = path.join(__dirname, "../uploads/");
app.use("/files/uploads/", express.static(imageRes));

app.get("/files/:folder/:img", (req, res) => {
  const imageName = `${req.params.folder}/${req.params.img}`;
  const imagePath = path.join(process.env.FILEPATH, "uploads", imageName);

  fs.readFile(imagePath, (err, data) => {
    if (err) {
      res.status(404).send("image not found");
    } else {
      if (
        imagePath.split(".")[1] == "jpg" ||
        imagePath.split(".")[1] == "png" ||
        imagePath.split(".")[1] == "jpeg"
      ) {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
      } else {
        res.writeHead(200, {
          "Content-Type": ["text/", "application/", "video/"],
        });
      }
      res.end(data);
    }
  });
});

app.use("/api", appRouter);

const root = path.join(__dirname, "../public/build");

app.use(express.static(root));
app.get("/*", (req, res) => {
  res.sendFile("index.html", { root });
});

// error handler
app.use((err, req, res, next) => {
  handleError(err, res);
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

module.exports = app;
