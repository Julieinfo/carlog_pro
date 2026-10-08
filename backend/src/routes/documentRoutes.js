const express = require('express');
const multer = require('multer');
const path = require('node:path');
const crypto = require('node:crypto');
const fs = require('node:fs');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validateObjectId = require('../middlewares/validateObjectId');
const { validateDocument, validateDocumentUpdate } = require('../middlewares/validators/documentValidator');
const controller = require('../controllers/documentController');

const router = express.Router();
const dossier = path.join(__dirname, '../../uploads/documents');
fs.mkdirSync(dossier, { recursive: true });
const typesAutorises = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain'];
const stockage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, dossier),
    filename: (_req, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({
    storage: stockage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => callback(null, typesAutorises.includes(file.mimetype))
});
const lecteurs = ['admin', 'fleet_manager', 'conducteur', 'mecanicien', 'comptable'];
const redacteurs = ['admin', 'fleet_manager', 'comptable'];

router.get('/', protect, authorize(...lecteurs), controller.getDocuments);
router.post('/', protect, authorize(...redacteurs), upload.single('fichier'), validateDocument, controller.creerDocument);
router.get('/:id/download', protect, authorize(...lecteurs), validateObjectId('id'), controller.telechargerDocument);
router.get('/:id/preview', protect, authorize(...lecteurs), validateObjectId('id'), controller.apercuDocument);
router.get('/:id', protect, authorize(...lecteurs), validateObjectId('id'), controller.getDocument);
router.put('/:id', protect, authorize(...redacteurs), validateObjectId('id'), validateDocumentUpdate, controller.modifierDocument);
router.delete('/:id', protect, authorize(...redacteurs), validateObjectId('id'), controller.supprimerDocument);

module.exports = router;
