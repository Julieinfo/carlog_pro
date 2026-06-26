const mongoose = require('mongoose');

const affectationSchema = new mongoose.Schema(
    {
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
        conducteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
        },
        dateDebut: {
        type: Date,
        required: true,
        default: Date.now
        },
        dateFin: {
        type: Date
        },
        kmDebut: {
        type: Number,
        required: true,
        min: 0
        },
        kmFin: {
        type: Number,
        min: 0
        },
        statut: {
        type: String,
        enum: ['en_cours', 'terminee', 'annulee'],
        default: 'en_cours'
        },
        observations: {
        type: String,
        trim: true
        }
    },
    { 
        timestamps: true 
    }
);

// Indexation pour chercher rapidement les affectations actives d'une entreprise
affectationSchema.index({ entreprise: 1, statut: 1 });
// Indexation pour l'historique d'un véhicule spécifique
affectationSchema.index({ vehicule: 1, dateDebut: -1 });
module.exports = mongoose.model('Affectation', affectationSchema);