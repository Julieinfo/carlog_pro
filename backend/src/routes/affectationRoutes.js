const express = require('express');
const router = express.Router();

// 1. Importation des verrous de sécurité
const { protect, authorize } = require('../middlewares/authMiddleware');

// 2. Importation de TOUTES les fonctions de ton contrôleur affectation
const {
    getAffectations,
    creerAffectation,
    getAffectationById,
    modifierAffectation,
    supprimerAffectation
} = require('../controllers/affectationController');

// ==========================================
// ROUTES PRIVÉES /api/affectations
// ==========================================

// Liste toutes les affectations et récupère une affectation spécifique (Ouvert à tous)
router.get('/', protect, authorize('admin', 'fleet_manager', 'conducteur'), getAffectations);
router.get('/:id', protect, authorize('admin', 'fleet_manager', 'conducteur'), getAffectationById);

// Créer, Modifier et Supprimer une affectation (Réservé Admin et Fleet Manager)
router.post('/', protect, authorize('admin', 'fleet_manager'), creerAffectation);
router.put('/:id', protect, authorize('admin', 'fleet_manager'), modifierAffectation);
router.delete('/:id', protect, authorize('admin', 'fleet_manager'), supprimerAffectation);

module.exports = router;