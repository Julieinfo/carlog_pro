const mongoose = require('mongoose');

const entretienSchema = new mongoose.Schema({
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
    typeEntretien: {
        type: String,
        enum: ['vidange', 'controle_technique', 'pneumatiques', 'reparation', 'revision', 'autre'],
        required: true
    },
    statut: {
        type: String,
        enum: ['planifie', 'en_cours', 'realise'],
        default: 'planifie'
    },
    dateEntretien: {
        type: Date,
        required: true
    },
    kilometragePrevisionnel: {
        type: Number,
        min: 0
    },
    kilometrageReel: {
        type: Number,
        min: 0
    },
    cout: {
        type: Number,
        min: 0,
        default: 0
    },
    description: {
        type: String,
        trim: true,
        maxlength: 2000
    }
}, { timestamps: true });

entretienSchema.index({ entreprise: 1, dateEntretien: -1 });
entretienSchema.index({ entreprise: 1, vehicule: 1, dateEntretien: -1 });

module.exports = mongoose.model('Entretien', entretienSchema);
