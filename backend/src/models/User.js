const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true }, // Ajouté
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    telephone: { type: String, trim: true }, // Ajouté
    motDePasse: { type: String, required: true, minlength: 8 },

    // Différenciation Particulier vs Entreprise
    typeCompte: { 
        type: String, 
        enum: ['particulier', 'entreprise'], 
        required: true 
    },

    // Rôles mis à jour (pertinents surtout si typeCompte === 'entreprise')
    role: { 
        type: String, 
        enum: ['admin', 'fleet_manager', 'conducteur', 'mecanicien', 'comptable'],
        default: null // Un particulier n'a pas forcément de rôle d'entreprise
    },

    // Référence à l'entreprise (optionnelle si c'est un particulier)
    entreprise: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Entreprise',
        required: function() { return this.typeCompte === 'entreprise'; } // Requis uniquement pour les pros
    },

    actif: { type: Boolean, default: true },
    }, { timestamps: true });
    // Hash avant sauvegarde
    userSchema.pre('save', async function (next) {
        if (!this.isModified('motDePasse')) return next();
            this.motDePasse = await bcrypt.hash(this.motDePasse, 12);
            next();
        });
    // Méthode de comparaison
    userSchema.methods.verifierMotDePasse = async function (candidat) {
        return bcrypt.compare(candidat, this.motDePasse);
    };

module.exports = mongoose.model('User', userSchema);