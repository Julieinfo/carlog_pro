const express = require('express');
const router = express.Router();

// Importation de tes verrous de sécurité
const { protect, authorize } = require('../middlewares/authMiddleware');

const {
    creerVehicule,
    getVehicules,
    getVehiculeById,
    modifierVehicule,
    supprimerVehicule
} = require('../controllers/vehiculeController');

// ==========================================
// ROUTES PRIVÉES /api/vehicules
// ==========================================

// 1. Consultation : Ouverte à TOUS les utilisateurs connectés de l'entreprise
router.get('/', protect, authorize('admin', 'fleet_manager', 'conducteur'), getVehicules);
router.get('/:id', protect, authorize('admin', 'fleet_manager', 'conducteur'), getVehiculeById);

// 2. Création et Modification : Réservées aux profils "Gestion" (Admin + Manager)
router.post('/', protect, authorize('admin', 'fleet_manager'), creerVehicule);
router.put('/:id', protect, authorize('admin', 'fleet_manager'), modifierVehicule);

// 3. Suppression : Réservée exclusivement à l'Admin
router.delete('/:id', protect, authorize('admin'), supprimerVehicule);

module.exports = router;