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
    terminerAffectation
} = require('../controllers/affectationController');

// ==========================================
// ROUTES PRIVÉES /api/affectations
// ==========================================

// Liste toutes les affectations et récupère une affectation spécifique (Ouvert à tous)
router.get('/', protect, authorize('admin', 'fleet_manager', 'conducteur'), getAffectations);
router.get('/:id', protect, authorize('admin', 'fleet_manager', 'conducteur'), getAffectationById);

// Créer, Modifier et Clore une affectation (Réservé Admin et Fleet Manager)
router.post('/', protect, authorize('admin', 'fleet_manager'), creerAffectation);
router.put('/:id', protect, authorize('admin', 'fleet_manager'), modifierAffectation);
router.put('/:id/terminer', protect, authorize('admin', 'fleet_manager'), terminerAffectation);

module.exports = router;