const { username, password } = require("./secrets.json");
const spicedPg = require("spiced-pg");
const db = spicedPg(
    `postgres://${username}:${password}@localhost:5432/imageboard`
);

exports.getImages = () => {
    return db.query(`
        SELECT *,
            (SELECT id FROM images
            ORDER BY id ASC
            LIMIT 1)
            AS lowest_id
        FROM images
        ORDER BY id DESC
        LIMIT 2;`);
};

exports.getImagesByTag = tagId => {
    return db.query(`
        SELECT *,
            (SELECT id FROM images
            ORDER BY id ASC
            LIMIT 1)
            AS lowest_id
        FROM images
        ORDER BY id DESC
        LIMIT 4;`);
};

exports.getMoreImages = oldestId => {
    return db
        .query(
            `SELECT *,
                (SELECT id FROM images
                ORDER BY id ASC
                LIMIT 1)
                AS lowest_id
            FROM images WHERE id < $1
            ORDER BY id DESC
            LIMIT 2;`,
            [oldestId]
        )
        .catch(err => {
            console.log(err);
            return Promise.reject(new Error("Can't get more images"));
        });
};

exports.getImage = id => {
    return db
        .query(
            `
        SELECT *,
            (SELECT id FROM images WHERE $1 - 1 = id) AS prev_id,
            (SELECT id FROM images WHERE $1 + 1 = id) AS next_id
        FROM images WHERE $1 = id;`,
            [id]
        )
        .catch(err => {
            console.log(err);
            return Promise.reject(new Error(`Can't get image with ID ${id}`));
        });
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

exports.getTags = imageId => {
    return db
        .query(
            `
            SELECT tag, image_tag.tag_id, image_tag.image_id
            FROM tags
            INNER JOIN image_tag ON tags.id = image_tag.tag_id
            WHERE $1 = image_tag.image_id
            ORDER BY tag DESC;
            `,
            [imageId]
        )
        .catch(err => {
            console.log(err);
            return Promise.reject(new Error("Can't get tags"));
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

exports.upsertTag = (tag, imageId) => {
    return db
        .query(
            `
        WITH insertedTag AS(
            INSERT INTO tags (tag)
            VALUES ($1)
            ON CONFLICT (tag) DO
            UPDATE SET tag = $1
            RETURNING id, tag
        ), insertedImageTag AS (
            INSERT INTO image_tag (tag_id, image_id)
            SELECT insertedTag.id, $2 FROM insertedTag
            RETURNING tag_id, image_id
        )
        SELECT tag, insertedImageTag.tag_id, insertedImageTag.image_id
        FROM insertedTag
        INNER JOIN insertedImageTag on insertedTag.id = insertedImageTag.tag_id;
        `,
            [tag, imageId]
        )
        .catch(err => {
            console.log(err);
            return Promise.reject(new Error("Can't insert tag"));
        });
};
