const express = require("express");
const app = express();
const db = require("./db");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.use(express.static("./public"));

app.get("/images", (req, res) => {
    db.getImages()
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch(err => {
            console.log(err);
        });
});

app.post("/upload", uploader.single("image"), (req, res) => {
    if (req.file) {
        const { file } = req;
        const { username, desc, title } = req.body;
        console.log(file, username, desc, title);
        res.sendStatus(200); // it worked!
    } else {
        res.sendStatus(500); // it did not worked!
    }
});

app.listen(8080, console.log("I'm listening"));
