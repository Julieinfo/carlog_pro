const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getAffectations, creerAffectation } = require('../controllers/affectationController');

// Routes protégées
router.get('/', protect, getAffectations);
router.post('/', protect, creerAffectation);

module.exports = router;