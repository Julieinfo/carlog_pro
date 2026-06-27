const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const { getDashboardStats } = require('../controllers/statsController');

// Route accessible uniquement pour la gestion
router.get('/', protect, authorize('admin', 'fleet_manager'), getDashboardStats);

module.exports = router;