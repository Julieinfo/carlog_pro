const { body, validationResult } = require('express-validator');

// Middleware générique pour bloquer la requête si express-validator trouve des erreurs
const validerReste = (req, res, next) => {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
        // On renvoie un statut 400 avec la liste de toutes les erreurs formatées
        return res.status(400).json({ erreurs: erreurs.array() });
    }
    next();
};

// Règles de validation pour l'inscription
exports.validateInscription = [
    // 1. Validation de l'Utilisateur
    body('nom')
        .trim()
        .notEmpty().withMessage('Le nom est obligatoire.')
        .isAlpha('fr-FR', { ignore: ' -' }).withMessage('Le nom ne doit contenir que des lettres.'),

    body('prenom')
        .trim()
        .notEmpty().withMessage('Le prénom est obligatoire.')
        .isAlpha('fr-FR', { ignore: ' -' }).withMessage('Le prénom ne doit contenir que des lettres.'),

    body('email')
        .trim()
        .notEmpty().withMessage('L\'adresse email est obligatoire.')
        .isEmail().withMessage('Le format de l\'email est invalide.')
        .normalizeEmail(), // Convertit en minuscules et nettoie l'email

    body('motDePasse')
        .notEmpty().withMessage('Le mot de passe est obligatoire.')
        .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.')
        .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule.')
        .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une minuscule.')
        .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.')
        .matches(/[\W_]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial.'),

    // 2. Validation de l'Entreprise liée
    body('nomEntreprise')
        .trim()
        .notEmpty().withMessage('Le nom de l\'entreprise est obligatoire.'),

    // On lance la vérification finale
    validerReste
];

// Règles de validation pour la connexion
exports.validateConnexion = [
    body('email')
        .trim()
        .notEmpty().withMessage('L\'adresse email est obligatoire.')
        .isEmail().withMessage('Le format de l\'email est invalide.')
        .normalizeEmail(),

    body('motDePasse')
        .notEmpty().withMessage('Le mot de passe est obligatoire.'),

    // Exécute la vérification et bloque si une règle échoue
    validerReste
];