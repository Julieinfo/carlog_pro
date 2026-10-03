const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const validateObjectId = require('../middlewares/validateObjectId');
const { validateCreerDepense, validateModifierDepense } = require('../middlewares/validators/depenseValidator');
const { creerDepense, getDepenses, getDepensesOverview, getCarburantOverview, modifierDepense, supprimerDepense } = require('../controllers/depenseController');

const lecteurs = ['admin', 'fleet_manager', 'conducteur', 'mecanicien', 'comptable'];
const redacteurs = ['admin', 'fleet_manager', 'comptable'];

router.get('/', protect, authorize(...lecteurs), getDepenses);
router.get('/overview', protect, authorize(...lecteurs), getDepensesOverview);
router.get('/carburant/overview', protect, authorize(...lecteurs), getCarburantOverview);
router.post('/', protect, authorize(...redacteurs), validateCreerDepense, creerDepense);
router.put('/:id', protect, authorize(...redacteurs), validateObjectId('id'), validateModifierDepense, modifierDepense);
router.delete('/:id', protect, authorize(...redacteurs), validateObjectId('id'), supprimerDepense);

module.exports = router;
