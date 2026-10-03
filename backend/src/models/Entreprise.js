const mongoose = require('mongoose');

// Schema Mongoose pour les entreprises clientes du SaaS.
// Ce modele contient toutes les informations legales et commerciales d'une entreprise.

const entrepriseSchema = new mongoose.Schema({
  // Bloc identite de la societe.
  // trim: true supprime les espaces inutiles pour eviter les doublons visuels.
  nom: { 
    type: String, 
    required: true, 
    trim: true 
  },
  logoUrl: { type: String, trim: true, default: '' },
  secteurActivite: { type: String, trim: true, default: '' },
  
  // Contacts utilises dans les echanges de gestion (facturation, support, alertes...).
  telephone: { 
    type: String, 
    required: true, 
    trim: true 
  },
  emailProfessionnel: { 
    type: String, 
    required: true, 
    lowercase: true, // Convertit automatiquement en minuscules pour la coherence
    trim: true 
  },
  
  // Adresse structuree pour eviter les champs "adresse" fourre-tout difficiles a exploiter ensuite.
  // J'ai choisi de structurer l'adresse en sous-champs pour pouvoir faire des recherches precisees
  // (ex: trouver toutes les entreprises d'une ville).
  adresse: {
    rue: { type: String, required: true },
    codePostal: { type: String, required: true },
    ville: { type: String, required: true },
    pays: { type: String, default: 'France' }
  },
  tailleFlotte: { type: Number, min: 0, default: 0 },
  devise: { type: String, enum: ['EUR', 'USD', 'GBP'], default: 'EUR' },
  fuseauHoraire: { type: String, default: 'Europe/Paris' },
  formatDate: { type: String, enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], default: 'DD/MM/YYYY' },
  uniteDistance: { type: String, enum: ['kilometres', 'miles'], default: 'kilometres' },
  uniteCarburant: { type: String, enum: ['litres', 'gallons'], default: 'litres' },
  seuilConsommationInhabituelle: { type: Number, min: 0, default: 12 },
  delaiAlerteDocument: { type: Number, min: 0, max: 365, default: 30 },
  delaiAlerteContrat: { type: Number, min: 0, max: 365, default: 30 },

  // Les identifiants legaux dependent du pays, d'ou les validations conditionnelles.
  siret: { 
    type: String, 
    unique: true, // Empêche les doublons de SIRET dans la base
    // Astuce apprise : sparse:true permet d'avoir plusieurs valeurs null sans erreur d'unicite.
    // C'est utile car le SIRET n'est pas obligatoire hors France, donc on peut avoir des null.
    sparse: true,
    trim: true,
    required: function() {
      // Pour la France, le SIRET est indispensable.
      // J'utilise une fonction pour rendre la condition dependante d'un autre champ.
      return this.adresse && this.adresse.pays === 'France';
    }
  },
  
  numeroIdentificationEtranger: {
    type: String,
    trim: true,
    required: function() {
      // Hors France, on bascule sur un identifiant legal alternatif.
      // Cette logique conditionnelle permet de s'adapter aux differentes legislations.
      return this.adresse && this.adresse.pays !== 'France';
    }
  },

  tvaIntracommunautaire: { 
    type: String, 
    trim: true 
  },

  // Permet d'anticiper les besoins (ex: quotas, onboarding, proposition de formule).
  // C'est une info commerciale utile pour l'equipe sales/support.
  tailleFlotteAttendue: { 
    type: Number, 
    default: 0 
  },

  // Champs SaaS relies a l'etat d'abonnement.
  // Ces champs permettent de gerer le cycle de vie de l'abonnement (trial -> active -> canceled).
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

  // Soft disable de l'entreprise sans perdre l'historique associe.
  // C'est important pour la conformite RGPD : on ne supprime jamais les donnees,
  // on desactive juste le compte. J'aurais pu faire un vrai delete, mais le soft delete est plus sur.
  actif: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Export du modele Mongoose pour pouvoir l'utiliser dans les controleurs.
module.exports = mongoose.model('Entreprise', entrepriseSchema);