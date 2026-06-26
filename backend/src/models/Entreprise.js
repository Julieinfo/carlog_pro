const mongoose = require('mongoose');

const entrepriseSchema = new mongoose.Schema({
  // Informations Générales
  nom: { 
    type: String, 
    required: true, 
    trim: true 
  },
  
  // Contact de l'entreprise
  telephone: { 
    type: String, 
    required: true, 
    trim: true 
  },
  emailProfessionnel: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true 
  },
  
  // Adresse du Siège / Dépôt
  adresse: {
    rue: { type: String, required: true },
    codePostal: { type: String, required: true },
    ville: { type: String, required: true },
    pays: { type: String, default: 'France' } // Ex: 'France', 'Belgique', 'Canada'...
  },

  // Identifiants fiscaux / légaux selon le pays
  siret: { 
    type: String, 
    unique: true, 
    sparse: true, // Permet d'ignorer l'index unique si le champ est absent/null
    trim: true,
    required: function() {
      // Requis uniquement si le pays est renseigné et vaut 'France'
      return this.adresse && this.adresse.pays === 'France';
    }
  },
  
  numeroIdentificationEtranger: {
    type: String,
    trim: true,
    required: function() {
      // Requis uniquement si le pays est renseigné et n'est pas 'France'
      return this.adresse && this.adresse.pays !== 'France';
    }
  },

  tvaIntracommunautaire: { 
    type: String, 
    trim: true 
  },

  // Configuration opérationnelle de CarLog Pro
  tailleFlotteAttendue: { 
    type: Number, 
    default: 0 
  },

  // Gestion SaaS & Abonnement
  statutAbonnement: { 
    type: String, 
    enum: ['trial', 'active', 'past_due', 'canceled'], 
    default: 'trial' 
  },
  formuleAbonnement: { 
    type: String, 
    enum: ['starter', 'premium', 'enterprise'], 
    default: 'starter' 
  },

  // Sécurité & Statut global
  actif: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Entreprise', entrepriseSchema);