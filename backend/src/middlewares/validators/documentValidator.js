const { body, validationResult } = require('express-validator');

const id = /^[0-9a-fA-F]{24}$/;
const types = ['assurance', 'carte_grise', 'controle_technique', 'leasing', 'location', 'facture', 'autre'];

const valider = (req, res, next) => {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) return res.status(400).json({ message: 'Données invalides.', erreurs: erreurs.array() });
    next();
};

exports.validateDocument = [
    body('vehicule').matches(id).withMessage('Le véhicule est obligatoire et invalide.'),
    body('typeDocument').isIn(types).withMessage('Le type de document est invalide.'),
    body('reference').optional().trim().isLength({ max: 200 }).withMessage('La référence est trop longue.'),
    body('prestataire').optional().trim().isLength({ max: 200 }).withMessage('Le prestataire est trop long.'),
    body('dateDebut').isISO8601().withMessage('La date de début est invalide.'),
    body('dateEcheance').isISO8601().withMessage('La date d’échéance est invalide.'),
    body('cout').optional().isFloat({ min: 0 }).withMessage('Le coût est invalide.'),
    valider
];

exports.validateDocumentUpdate = [
    body('vehicule').optional().matches(id).withMessage('Le véhicule est invalide.'),
    body('typeDocument').optional().isIn(types).withMessage('Le type de document est invalide.'),
    body('reference').optional().trim().isLength({ max: 200 }).withMessage('La référence est trop longue.'),
    body('prestataire').optional().trim().isLength({ max: 200 }).withMessage('Le prestataire est trop long.'),
    body('dateDebut').optional().isISO8601().withMessage('La date de début est invalide.'),
    body('dateEcheance').optional().isISO8601().withMessage('La date d’échéance est invalide.'),
    body('cout').optional().isFloat({ min: 0 }).withMessage('Le coût est invalide.'),
    body('statut').optional().isIn(['actif', 'a_renouveler', 'urgent', 'expire', 'archive']).withMessage('Le statut est invalide.'),
    valider
];
