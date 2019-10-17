const db = require("./db");
module.exports.requireNumber = (req, res, next) => {
    const { imageId } = req.params;
    return isNaN(parseInt(imageId))
        ? res.json(new Error("Need a number"))
        : next();
};

module.exports.formatTags = (req, res, next) => {
    let { tags, imageId } = req.body;
    let tagPromises = [];
    tags = tags.split(", ");
    tags.forEach(tag => {
        let formattedTag = tag
            .split(" ")
            .map(word => {
                let newWord = word.toLowerCase();
                newWord = newWord[0].toUpperCase() + newWord.slice(1);
                return newWord;
            })
            .join("");
        if (imageId) {
            tagPromises.push(db.upsertTag(formattedTag, imageId));
        }
    });
    delete req.body.tags;
    req.body.tagPromises = tagPromises;
    if (next) {
        next();
    }
};
