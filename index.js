const express = require("express");
const app = express();
const db = require("./db");

app.use(express.static("./public"));

app.get("/chickens", (req, res) => {
    res.json([
        { name: "Chicken Little" },
        { name: "Funky Chicken" },
        { name: "Chick Norries" }
    ]);
});

app.get("/images", (req, res) => {
    db.getImages()
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch(err => {
            console.log(err);
        });
});

app.listen(8080, console.log("I'm listening"));
