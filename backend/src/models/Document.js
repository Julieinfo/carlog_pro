const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    entreprise: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise', required: true, index: true },
    vehicule: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicule', required: true, index: true },
    typeDocument: {
        type: String,
        enum: ['assurance', 'carte_grise', 'controle_technique', 'leasing', 'location', 'facture', 'autre'],
        required: true
    },
    reference: { type: String, trim: true, maxlength: 200 },
    prestataire: { type: String, trim: true, maxlength: 200 },
    dateDebut: { type: Date, required: true },
    dateEcheance: { type: Date, required: true },
    cout: { type: Number, min: 0 },
    statut: {
        type: String,
        enum: ['actif', 'a_renouveler', 'urgent', 'expire', 'archive'],
        default: 'actif'
    },
    nomOriginal: { type: String, required: true, maxlength: 255 },
    nomFichier: { type: String, required: true, unique: true },
    cheminFichier: { type: String, required: true },
    mimeType: { type: String, required: true },
    taille: { type: Number, required: true, min: 1 }
}, { timestamps: true });

documentSchema.index({ entreprise: 1, dateEcheance: 1 });
documentSchema.index({ entreprise: 1, typeDocument: 1, statut: 1 });

module.exports = mongoose.model('Document', documentSchema);
