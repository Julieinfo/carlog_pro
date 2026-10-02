const mongoose = require('mongoose');

const depenseSchema = new mongoose.Schema({
    entreprise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entreprise',
        required: true
    },
    vehicule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicule',
        required: true
    },
    categorie: {
        type: String,
        enum: ['carburant', 'peages', 'assurances', 'leasing', 'entretien', 'reparation', 'autres'],
        required: true
    },
    dateDepense: {
        type: Date,
        required: true
    },
    montant: {
        type: Number,
        min: 0,
        required: true
    },
    kilometrage: {
        type: Number,
        min: 0
    },
    litres: {
        type: Number,
        min: 0
    },
    prixAuLitre: {
        type: Number,
        min: 0
    },
    stationService: {
        type: String,
        trim: true,
        maxlength: 200
    },
    typeCarburant: {
        type: String,
        enum: ['diesel', 'essence', 'gnv', 'electrique', 'hydrogene', 'hybride']
    },
    description: {
        type: String,
        trim: true,
        maxlength: 2000
    }
}, { timestamps: true });

depenseSchema.index({ entreprise: 1, dateDepense: -1 });
depenseSchema.index({ entreprise: 1, vehicule: 1, dateDepense: -1 });
depenseSchema.index({ entreprise: 1, categorie: 1, dateDepense: -1 });

module.exports = mongoose.model('Depense', depenseSchema);
