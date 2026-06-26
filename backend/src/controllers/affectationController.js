    const Affectation = require('../models/Affectation');

// ==========================================
// GET /api/affectations (Récupérer toutes les affectations de l'entreprise)
// ==========================================
exports.getAffectations = async (req, res) => {
    try {
        // Sécurité multi-tenant : on ne récupère QUE les affectations de l'entreprise de l'utilisateur connecté
        const entrepriseId = req.user.entreprise;

        const affectations = await Affectation.find({ entreprise: entrepriseId })
        .populate('vehicule', 'marque modele immatriculation') // optionnel: pour embarquer les détails du véhicule
        .populate('conducteur', 'nom prenom email')            // optionnel: pour embarquer les détails du chauffeur
        .sort({ dateDebut: -1 }); // Les plus récentes en premier

        res.status(200).json(affectations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================================
// POST /api/affectations (Créer une nouvelle affectation)
// ==========================================
exports.creerAffectation = async (req, res) => {
    try {
        const entrepriseId = req.user.entreprise;
        const { vehicule, conducteur, dateDebut, kmDebut, observations } = req.body;

        // 1. Vérification basique des champs obligatoires
        if (!vehicule || !conducteur || !kmDebut) {
        return res.status(400).json({ message: 'Veuillez fournir le véhicule, le conducteur et le kilométrage de départ.' });
        }

        // 2. Règle métier : Vérifier si le véhicule est déjà pris
        const vehiculeOccupe = await Affectation.findOne({
        entreprise: entrepriseId,
        vehicule,
        statut: 'en_cours'
        });
        if (vehiculeOccupe) {
        return res.status(400).json({ message: 'Ce véhicule est déjà affecté à un autre conducteur actuellement.' });
        }

        // 3. Règle métier : Vérifier si le conducteur conduit déjà un autre véhicule
        const conducteurOccupe = await Affectation.findOne({
        entreprise: entrepriseId,
        conducteur,
        statut: 'en_cours'
        });
        if (conducteurOccupe) {
        return res.status(400).json({ message: 'Ce conducteur est déjà affecté à un autre véhicule actuellement.' });
        }

        // 4. Création de l'affectation
        const nouvelleAffectation = await Affectation.create({
        entreprise: entrepriseId, // Forcé pour l'isolation multi-tenant
        vehicule,
        conducteur,
        dateDebut: dateDebut || Date.now(),
        kmDebut,
        observations,
        statut: 'en_cours'
        });

        res.status(201).json(nouvelleAffectation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};