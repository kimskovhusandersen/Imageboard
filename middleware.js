module.exports.requireNumber = (req, res, next) => {
    const { imageId } = req.params;
    return isNaN(parseInt(imageId))
        ? res.json(new Error("Need a number"))
        : next();
};

module.exports.formatTags = (req, res, next) => {
    let { tags } = req.body;
    if (tags) {
        tags = tags.split(", ");
        tags.forEach((tag, i) => {
            tags[i] = tag.replace(/[^a-z0-9 ,.?!]/gi, "").trim();
            tags[i] = tag.replace(/[ ]{2,}/g, "");
        });
        tags = tags.filter(tag => tag != "");
        tags.forEach((tag, i) => {
            tags[i] = tag
                .split(" ")
                .filter(l => l != "")
                .map(word => {
                    word = word.toLowerCase();
                    word = word[0].toUpperCase() + word.slice(1);
                    return word;
                })
                .join("");
        });
        delete req.body.tags;
        req.body.tags = tags;
    }
    if (next) {
        next();
    }
};
