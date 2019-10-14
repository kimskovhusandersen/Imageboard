const { username, password } = require("./secrets.json");
const spicedPg = require("spiced-pg");
const db = spicedPg(
    `postgres://${username}:${password}@localhost:5432/imageboard`
);

exports.getImages = () => {
    return db.query(`SELECT * FROM images ORDER BY id DESC;`);
};
