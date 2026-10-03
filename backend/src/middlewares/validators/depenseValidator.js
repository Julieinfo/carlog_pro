const { body, validationResult } = require('express-validator');

const id = /^[0-9a-fA-F]{24}$/;
const categories = ['carburant', 'peages', 'assurances', 'leasing', 'entretien', 'reparation', 'autres'];

const validerDepense = (req, res, next) => {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) return res.status(400).json({ message: 'Données invalides.', erreurs: erreurs.array() });
    next();
};

exports.validateCreerDepense = [
    body('vehicule').matches(id).withMessage('Le véhicule est obligatoire et invalide.'),
    body('categorie').isIn(categories).withMessage('La catégorie est invalide.'),
    body('dateDepense').isISO8601().withMessage('La date est invalide.'),
    body('montant').isFloat({ min: 0 }).withMessage('Le montant doit être positif ou nul.'),
    body('kilometrage').optional().isFloat({ min: 0 }).withMessage('Le kilométrage est invalide.'),
    body('litres').optional().isFloat({ min: 0 }).withMessage('Le nombre de litres est invalide.'),
    body('prixAuLitre').optional().isFloat({ min: 0 }).withMessage('Le prix au litre est invalide.'),
    body('stationService').optional().trim().isLength({ max: 200 }).withMessage('Le nom de la station est trop long.'),
    body('typeCarburant').optional().isIn(['diesel', 'essence', 'gnv', 'electrique', 'hydrogene', 'hybride']).withMessage('Le type de carburant est invalide.'),
    body('description').optional().trim().isLength({ max: 2000 }).withMessage('La description est trop longue.'),
    validerDepense
];

exports.validateModifierDepense = [
    body('vehicule').optional().matches(id).withMessage('Le véhicule est invalide.'),
    body('categorie').optional().isIn(categories).withMessage('La catégorie est invalide.'),
    body('dateDepense').optional().isISO8601().withMessage('La date est invalide.'),
    body('montant').optional().isFloat({ min: 0 }).withMessage('Le montant doit être positif ou nul.'),
    body('kilometrage').optional().isFloat({ min: 0 }).withMessage('Le kilométrage est invalide.'),
    body('litres').optional().isFloat({ min: 0 }).withMessage('Le nombre de litres est invalide.'),
    body('prixAuLitre').optional().isFloat({ min: 0 }).withMessage('Le prix au litre est invalide.'),
    body('stationService').optional().trim().isLength({ max: 200 }).withMessage('Le nom de la station est trop long.'),
    body('typeCarburant').optional().isIn(['diesel', 'essence', 'gnv', 'electrique', 'hydrogene', 'hybride']).withMessage('Le type de carburant est invalide.'),
    body('description').optional().trim().isLength({ max: 2000 }).withMessage('La description est trop longue.'),
    validerDepense
];
