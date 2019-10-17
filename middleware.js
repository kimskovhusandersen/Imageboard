module.exports.requireNumber = (req, res, next) => {
    const { imageId } = req.params;
    return isNaN(parseInt(imageId))
        ? res.json(new Error("Need a number"))
        : next();
};
