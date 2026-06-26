const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    creerVehicule,
    getVehicules,
    getVehiculeById,
    modifierVehicule,
    supprimerVehicule
} = require('../controllers/vehiculeController');

// ==========================================
// ROUTES PRIVÉES (Sécurisées par JWT via protect)
// Prefixe global dans app.js : /api/vehicules
// ==========================================

// 1. [CREATE] - Ajouter un véhicule
router.post('/', protect, creerVehicule);

// 2. [READ ALL] - Récupérer la flotte de l'entreprise
router.get('/', protect, getVehicules);

// 3. [READ ONE] - Récupérer les détails d'un véhicule spécifique
router.get('/:id', protect, getVehiculeById);

// 4. [UPDATE] - Modifier les informations d'un véhicule
router.put('/:id', protect, modifierVehicule);

// 5. [DELETE] - Supprimer ou archiver un véhicule
router.delete('/:id', protect, supprimerVehicule);

module.exports = router;