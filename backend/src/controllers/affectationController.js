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

// ==========================================
// GET /api/affectations/:id (Lire une seule affectation - Sécurisée)
// ==========================================

exports.getAffectationById = async (req, res) => {
    try {
        const entrepriseId = req.user.entreprise;

        // Sécurisation multi-tenant : l'affectation doit appartenir à l'entreprise de l'user
        const affectation = await Affectation.findOne({ _id: req.params.id, entreprise: entrepriseId })
            .populate('conducteur', 'nom prenom email')
            .populate('vehicule', 'immatriculation marque modele');

        if (!affectation) {
            return res.status(404).json({ message: 'Affectation introuvable ou accès refusé.' });
        }

        res.status(200).json(affectation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================================
// PUT /api/affectations/:id (Modifier une affectation - Sécurisée)
// ==========================================

exports.modifierAffectation = async (req, res) => {
    try {
        const entrepriseId = req.user.entreprise;

        // Sécurisation multi-tenant : on filtre par ID ET par entreprise
        const affectationModifiee = await Affectation.findOneAndUpdate(
            { _id: req.params.id, entreprise: entrepriseId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!affectationModifiee) {
            return res.status(404).json({ message: 'Affectation introuvable ou accès refusé.' });
        }

        res.status(200).json({ message: 'Affectation mise à jour avec succès.', affectation: affectationModifiee });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================================
// PUT /api/affectations/:id/terminer (Clore proprement une affectation pour l'historique)
// ==========================================

exports.terminerAffectation = async (req, res) => {
    try {
        const entrepriseId = req.user.entreprise;
        const { dateFin, kmFin, observationsFin } = req.body;

        if (!kmFin) {
            return res.status(400).json({ message: 'Le kilométrage de fin est obligatoire pour clore l\'affectation.' });
        }

        // On cherche l'affectation active appartenant à l'entreprise
        const affectation = await Affectation.findOne({ _id: req.params.id, entreprise: entrepriseId });

        if (!affectation) {
            return res.status(404).json({ message: 'Affectation introuvable ou accès refusé.' });
        }

        if (affectation.statut === 'terminee') {
            return res.status(400).json({ message: 'Cette affectation est déjà clôturée.' });
        }

        // Règle métier : Le kilométrage de fin ne peut pas être inférieur au kilométrage de départ
        if (kmFin < affectation.kmDebut) {
            return res.status(400).json({ 
                message: `Le kilométrage de fin (${kmFin} km) ne peut pas être inférieur au kilométrage de départ (${affectation.kmDebut} km).` 
            });
        }

        // Mise à jour pour l'historique
        affectation.statut = 'terminee';
        affectation.dateFin = dateFin || Date.now();
        affectation.kmFin = kmFin;
        if (observationsFin) affectation.observations = `${affectation.observations || ''} | Fin: ${observationsFin}`;

        await affectation.save();

        res.status(200).json({ message: 'Affectation clôturée avec succès et archivée dans l\'historique.', affectation });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};