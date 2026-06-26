const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // 1. On vérifie si le token est présent dans les headers (Authorization: Bearer <token>)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
        // 2. On extrait le token de la chaîne "Bearer <token>"
        token = req.headers.authorization.split(' ')[1];

        // 3. On décode et vérifie le token avec la clé secrète
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. On récupère l'utilisateur en BDD (sans son mot de passe) et on l'injecte dans 'req.user'
        req.user = await User.findById(decoded.id).select('-motDePasse');

        if (!req.user) {
            return res.status(401).json({ message: 'Utilisateur introuvable, accès refusé.' });
        }

        // 5. Tout est bon, on passe au middleware ou contrôleur suivant
        next();
        } catch (error) {
            console.error('Erreur validation token:', error.message);
            return res.status(401).json({ message: 'Token invalide ou expiré, accès non autorisé.' });
        }
    }

    // Si aucun token n'a été trouvé dans les headers
    if (!token) {
        return res.status(401).json({ message: 'Accès refusé, aucun token fourni.' });
    }
};

module.exports = { protect };