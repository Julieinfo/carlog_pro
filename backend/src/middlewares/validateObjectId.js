const mongoose = require('mongoose');

const validateObjectId = (parametre) => (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params[parametre])) {
        return res.status(400).json({ message: `Identifiant ${parametre} invalide.` });
    }
    next();
};

module.exports = validateObjectId;
