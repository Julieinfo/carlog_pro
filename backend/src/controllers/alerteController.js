const Alerte = require('../models/Alerte');

// ==========================================
// 1. [CREATE] - Créer une alerte
// POST /api/alertes
// ==========================================

exports.creerAlerte = async (req, res) => {
    try {
        const entrepriseId = req.user.entreprise;
        const { vehicule, conducteur, titre, description, typeAlerte, niveauUrgence, statut } = req.body;

        // Validation des champs obligatoires selon ton schéma
        if (!titre || !typeAlerte) {
        return res.status(400).json({ message: 'Le titre et le type d\'alerte sont obligatoires.' });
        }

        const nouvelleAlerte = await Alerte.create({
        entreprise: entrepriseId, // Forcé pour l'isolation multi-tenant
        vehicule,
        conducteur,
        titre,
        description,
        typeAlerte,
        niveauUrgence,
        statut
        });

        res.status(201).json(nouvelleAlerte);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================================
// 2. [READ ALL] - Récupérer toutes les alertes de l'entreprise
// GET /api/alertes
// ==========================================

exports.getAlertes = async (req, res) => {
    try {
        const entrepriseId = req.user.entreprise;
        
        // Possibilité de filtrer par statut via l'URL (ex: /api/alertes?statut=active)
        const filtre = { entreprise: entrepriseId };
        if (req.query.statut) {
        filtre.statut = req.query.statut;
        }

        const alertes = await Alerte.find(filtre)
        .populate('vehicule', 'marque modele immatriculation')
        .populate('conducteur', 'nom prenom email')
        .sort({ createdAt: -1 }); // Les plus récentes d'abord (createdAt généré par les timestamps)

        res.status(200).json(alertes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================================
// 3. [READ VEHICLE HISTORY] - Historique des alertes d'un véhicule
// GET /api/alertes/vehicule/:vehiculeId
// ==========================================

exports.getAlertesByVehicule = async (req, res) => {
    try {
        const { vehiculeId } = req.params;
        const entrepriseId = req.user.entreprise;

        // Sécurité multi-tenant : on s'assure que le véhicule appartient à la même boîte
        const alertes = await Alerte.find({ 
        entreprise: entrepriseId, 
        vehicule: vehiculeId 
        })
        .populate('conducteur', 'nom prenom')
        .sort({ createdAt: -1 });

        res.status(200).json(alertes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================================
// 4. [READ ONE] - Détails d'une seule alerte
// GET /api/alertes/:id
// ==========================================

exports.getAlerteById = async (req, res) => {
    try {
        const { id } = req.params;
        const entrepriseId = req.user.entreprise;

        const alerte = await Alerte.findById(id)
        .populate('vehicule', 'marque modele immatriculation')
        .populate('conducteur', 'nom prenom')
        .populate('resoluePar', 'nom prenom');

        if (!alerte || alerte.entreprise.toString() !== entrepriseId.toString()) {
        return res.status(404).json({ message: 'Alerte introuvable ou accès non autorisé.' });
        }

        res.status(200).json(alerte);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================================
// 5. [UPDATE] - Modifier ou Résoudre une alerte
// PUT /api/alertes/:id
// ==========================================

exports.modifierAlerte = async (req, res) => {
    try {
        const { id } = req.params;
        const entrepriseId = req.user.entreprise;

        let alerte = await Alerte.findById(id);

        if (!alerte || alerte.entreprise.toString() !== entrepriseId.toString()) {
        return res.status(404).json({ message: 'Alerte introuvable ou accès non autorisé.' });
        }

        // REGLE METIER : Si le statut passe à 'resolue', on injecte l'utilisateur connecté et la date actuelle
        if (req.body.statut === 'resolue' && alerte.statut !== 'resolue') {
        req.body.resoluePar = req.user._id; // L'ID de l'utilisateur extrait du token JWT
        req.body.dateResolution = Date.now();
        }

        alerte = await Alerte.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
        });

        res.status(200).json(alerte);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================================
// 6. [DELETE] - Supprimer définitivement une alerte
// DELETE /api/alertes/:id
// ==========================================

exports.supprimerAlerte = async (req, res) => {
    try {
        const { id } = req.params;
        const entrepriseId = req.user.entreprise;

        const alerte = await Alerte.findById(id);

        if (!alerte || alerte.entreprise.toString() !== entrepriseId.toString()) {
        return res.status(404).json({ message: 'Alerte introuvable ou accès non autorisé.' });
        }

        // Contrairement aux camions, on peut faire une suppression totale pour les erreurs de saisie
        await Alerte.findByIdAndDelete(id);

        res.status(200).json({ message: 'Alerte supprimée avec succès.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};