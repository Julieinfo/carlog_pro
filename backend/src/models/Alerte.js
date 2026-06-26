const mongoose = require('mongoose');

const alerteSchema = new mongoose.Schema(
    {
        // Indispensable pour le multi-tenant : isole les alertes par entreprise
        entreprise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entreprise',
        required: true
        },
        // Optionnel au niveau DB pour permettre des alertes globales ou administratives
        vehicule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicule',
        required: false
        },
        // Optionnel au niveau DB (ex: alerte comportement ou smartphone conducteur)
        conducteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
        },
        titre: {
        type: String,
        required: true,
        trim: true
        },
        description: {
        type: String,
        trim: true
        },
        typeAlerte: {
        type: String,
        enum: ['maintenance', 'carburant', 'securite', 'geo-fencing', 'administratif'],
        required: true
        },
        niveauUrgence: {
        type: String,
        enum: ['low', 'medium', 'critical'],
        default: 'medium'
        },
        statut: {
        type: String,
        enum: ['active', 'en_cours', 'resolue', 'acquittee'],
        default: 'active'
        },
        resoluePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        },
        dateResolution: {
        type: Date
        }
    },
    { 
        // Génère automatiquement les champs createdAt (date de déclenchement) et updatedAt
        timestamps: true 
    }
);

// Index composé pour optimiser les requêtes du tableau de bord (récupérer vite les alertes actives de la boîte)
alerteSchema.index({ entreprise: 1, statut: 1 });
module.exports = mongoose.model('Alerte', alerteSchema);