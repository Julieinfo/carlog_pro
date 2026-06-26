const express = require('express');
const router = express.Router();

// Import des fonctions du contrôleur (qu'on va coder juste après)
const { inscription, connexion } = require('../controllers/authController');

// Route pour la création de compte (Entreprise + Admin)
router.post('/inscription', inscription);

// Route pour la connexion
router.post('/connexion', connexion);

module.exports = router;