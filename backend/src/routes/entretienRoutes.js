const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const validateObjectId = require('../middlewares/validateObjectId');
const { validateCreerEntretien, validateModifierEntretien } = require('../middlewares/validators/entretienValidator');
const {
    creerEntretien, getEntretiens, getEntretienById, modifierEntretien, supprimerEntretien
} = require('../controllers/entretienController');

router.get('/', protect, authorize('admin', 'fleet_manager', 'conducteur', 'mecanicien', 'comptable'), getEntretiens);
router.get('/:id', protect, authorize('admin', 'fleet_manager', 'conducteur', 'mecanicien', 'comptable'), validateObjectId('id'), getEntretienById);
router.post('/', protect, authorize('admin', 'fleet_manager', 'mecanicien'), validateCreerEntretien, creerEntretien);
router.put('/:id', protect, authorize('admin', 'fleet_manager', 'mecanicien'), validateObjectId('id'), validateModifierEntretien, modifierEntretien);
router.delete('/:id', protect, authorize('admin', 'fleet_manager'), validateObjectId('id'), supprimerEntretien);

module.exports = router;
