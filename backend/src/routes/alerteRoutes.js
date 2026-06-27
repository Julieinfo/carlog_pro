const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

const {
    creerAlerte,
    getAlertes,
    getAlerteById,
    getAlertesByVehicule,
    modifierAlerte,
    supprimerAlerte
} = require('../controllers/alerteController');

// ==========================================
// ROUTES PRIVÉES (Sécurisées par JWT via protect)
// Préfixe global dans app.js : /api/alertes
// ==========================================

// 1. [CREATE] - Créer une alerte (Manuelle ou Automatique)
router.post('/', protect, creerAlerte);

// 2. [READ ALL] - Récupérer toutes les alertes de l'entreprise
// (Pratique pour filtrer par statut via req.query ex: ?statut=en_cours)
router.get('/', protect, getAlertes);

// 3. [READ VEHICLE HISTORY] - Récupérer l'historique des alertes d'un véhicule spécifique
router.get('/vehicule/:vehiculeId', protect, getAlertesByVehicule);

// 4. [READ ONE] - Récupérer les détails d'une alerte spécifique
router.get('/:id', protect, getAlerteById);

// 5. [UPDATE] - Modifier ou Résoudre une alerte (statut, notes de maintenance...)
router.put('/:id', protect, modifierAlerte);

// 6. [DELETE] - Supprimer définitivement une alerte (erreur de saisie)
router.delete('/:id', protect, supprimerAlerte);

module.exports = router;