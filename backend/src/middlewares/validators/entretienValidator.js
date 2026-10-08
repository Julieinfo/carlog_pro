const { body, validationResult } = require('express-validator');

const validerEntretien = (req, res, next) => {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) return res.status(400).json({ message: 'Données invalides.', erreurs: erreurs.array() });
    next();
};

const types = ['vidange', 'controle_technique', 'pneumatiques', 'reparation', 'revision', 'autre'];
const statuts = ['planifie', 'en_cours', 'realise'];
const id = /^[0-9a-fA-F]{24}$/;

const champsCommuns = [
    body('vehicule').matches(id).withMessage('Le véhicule est obligatoire et invalide.'),
    body('typeEntretien').isIn(types).withMessage("Le type d'entretien est invalide."),
    body('statut').optional().isIn(statuts).withMessage("Le statut de l'entretien est invalide."),
    body('dateEntretien').isISO8601().withMessage("La date d'entretien est invalide."),
    body('kilometragePrevisionnel').optional().isFloat({ min: 0 }).withMessage('Le kilométrage prévisionnel est invalide.'),
    body('kilometrageReel').optional().isFloat({ min: 0 }).withMessage('Le kilométrage réel est invalide.'),
    body('cout').optional().isFloat({ min: 0 }).withMessage('Le coût doit être positif ou nul.'),
    body('description').optional().trim().isLength({ max: 2000 }).withMessage('La description est trop longue.')
];

exports.validateCreerEntretien = [...champsCommuns, validerEntretien];
exports.validateModifierEntretien = [
    body('vehicule').optional().matches(id).withMessage('Le véhicule est invalide.'),
    body('typeEntretien').optional().isIn(types).withMessage("Le type d'entretien est invalide."),
    body('statut').optional().isIn(statuts).withMessage("Le statut de l'entretien est invalide."),
    body('dateEntretien').optional().isISO8601().withMessage("La date d'entretien est invalide."),
    body('kilometragePrevisionnel').optional().isFloat({ min: 0 }).withMessage('Le kilométrage prévisionnel est invalide.'),
    body('kilometrageReel').optional().isFloat({ min: 0 }).withMessage('Le kilométrage réel est invalide.'),
    body('cout').optional().isFloat({ min: 0 }).withMessage('Le coût doit être positif ou nul.'),
    body('description').optional().trim().isLength({ max: 2000 }).withMessage('La description est trop longue.'),
    validerEntretien
];
