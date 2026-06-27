const express = require('express');
const router = express.Router();
const { validateInscription, validateConnexion } = require('../middlewares/validators/authValidator');
// Import des fonctions du contrôleur (qu'on va coder juste après)
const { inscription, connexion } = require('../controllers/authController');

// Route pour la création de compte (Entreprise + Admin)
router.post('/inscription', validateInscription, inscription);

// Route pour la connexion
router.post('/connexion', validateConnexion, connexion);

module.exports = router;