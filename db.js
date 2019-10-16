const { username, password } = require("./secrets.json");
const spicedPg = require("spiced-pg");
const db = spicedPg(
    `postgres://${username}:${password}@localhost:5432/imageboard`
);

exports.getImages = () => {
    return db.query(`SELECT * FROM images ORDER BY id DESC;`);
};

exports.getImage = id => {
    return db.query(`SELECT * FROM images WHERE $1 = id`, [id]);
};

exports.getComments = imageId => {
    return db
        .query(`SELECT * FROM comments WHERE $1 = image_id ORDER BY id DESC;`, [
            imageId
        ])
        .catch(err => {
            console.log(err);
            return Promise.reject(new Error("Can't get comments"));
        });
};

exports.addImage = (username, title, desc, imageUrl) => {
    return db
        .query(
            `
        INSERT INTO images (username, title, description, url) VALUES ($1, $2, $3, $4) RETURNING *;
        `,
            [username, title, desc, imageUrl]
        )
        .catch(err => {
            console.log(err);
            return Promise.reject(new Error("Can't insert image"));
        });
};

exports.addComment = (username, comment, imageId) => {
    return db
        .query(
            `
        INSERT INTO comments (username, comment, image_id) VALUES ($1, $2, $3) RETURNING *;
        `,
            [username, comment, imageId]
        )
        .catch(err => {
            console.log(err);
            return Promise.reject(new Error("Can't insert comment"));
        });
};
