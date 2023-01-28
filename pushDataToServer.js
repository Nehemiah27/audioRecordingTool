const express = require("express");
var cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
var fs = require("fs");
var actualFolder = "default";
function folderCreation() {
  if (!fs.existsSync(actualFolder)) {
    fs.mkdirSync(actualFolder);
  }
}
app.post("/formPost", (req, res) => {
  actualFolder = `./storage/${req.body.userId}`;
});
const multer = require("multer");
const exp = require("constants");
var storage = multer.diskStorage({
  destination: function (req, filed, cb) {
    cb(null, `${actualFolder}/`);
  },
  filename: function (req, filed, cb) {
    cb(null, `${Date.now()}${filed.originalname}.mp3`);
  },
});
const uploading = multer({ storage: storage }).single("audiofile");
app.get("/", (req, res) => {
  res.send("hello");
});
app.get("/upload-mp3", (req, res) => {
  console.log(req);
  res.send("Upload API Address for Audio Recording Page");
});
app.post("/upload-mp3", (req, res) => {
  folderCreation();
  uploading(req, res, function (err) {
    if (err) {
      console.log(err);
    } else {
      res.send(req.file);
    }
  });
});
app.listen(5020, () => {
  console.log("listening on port 5020");
});
