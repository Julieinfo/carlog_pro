const mongoose = require("mongoose");

const vehiculeSchema = new mongoose.Schema({
    entreprise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Entreprise",
        required: true
    },
    // Retrait du unique: true global ici
    immatriculation: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    marque: {
        type: String,
        required: true,
        trim: true
    },
    modele: {
        type: String,
        required: true,
        trim: true
    },
    annee: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear() + 1
    },
    typeVehicule: {
        type: String,
        enum: ["porteur", "tracteur", "remorque", "utilitaire", "voiture"],
        required: true
    },
    ptac: {
        type: Number,
        required: true,
        min: 0
    },
    carburant: {
        type: String,
        enum: ["diesel", "gnv", "electrique", "hydrogene", "essence", "hybride"],
        default: "diesel"
    },
    kilometrage: {
        type: Number,
        default: 0,
        min: 0
    },
    dateMiseEnService: {
        type: Date
    },
    statut: {
        type: String,
        enum: ["disponible", "en_course", "en_maintenance", "en_panne"],
        default: "disponible"
    },
    conducteurPrincipal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    actif: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true
    }
);

// Index composé pour l'unicité par entreprise uniquement
vehiculeSchema.index({ entreprise: 1, immatriculation: 1 }, { unique: true });
module.exports = mongoose.model("Vehicule", vehiculeSchema);