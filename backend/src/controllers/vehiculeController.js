const Vehicule = require('../models/Vehicule');

// ==========================================
// 1. [CREATE] - Ajouter un véhicule
// POST /api/vehicules
// ==========================================

exports.creerVehicule = async (req, res) => {
    try {
        const entrepriseId = req.user.entreprise;
        const { immatriculation, marque, modele, typeVehicule, kilometrage, ptac, carburant, statut } = req.body;

        // Validation des champs obligatoires
        if (!immatriculation || !marque || !modele) {
        return res.status(400).json({ message: 'L\'immatriculation, la marque et le modèle sont obligatoires.' });
        }

        // Vérifier si l'immatriculation existe déjà en base de données
        const vehiculeExistant = await Vehicule.findOne({ entreprise: entrepriseId, immatriculation: immatriculation.toUpperCase().trim() });
        if (vehiculeExistant) {
        return res.status(400).json({ message: 'Un véhicule avec cette immatriculation existe déjà.' });
        }

        const nouveauVehicule = await Vehicule.create({
        entreprise: entrepriseId, // Forcé depuis le token pour le multi-tenant
        immatriculation: immatriculation.toUpperCase().trim(),
        marque,
        modele,
        typeVehicule,
        kilometrage,
        ptac,
        carburant,
        statut
        });

        res.status(201).json(nouveauVehicule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================================
// 2. [READ ALL] - Récupérer la flotte de l'entreprise
// GET /api/vehicules
// ==========================================

exports.getVehicules = async (req, res) => {
    try {
        const entrepriseId = req.user.entreprise;

        // Sécurité : On ne récupère QUE les véhicules de l'entreprise de l'utilisateur connecté
        // On exclut les véhicules archivés si tu optes pour le Soft Delete
        const vehicules = await Vehicule.find({ entreprise: entrepriseId, actif: true });

        res.status(200).json(vehicules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================================
// 3. [READ ONE] - Détails d'un véhicule spécifique
// GET /api/vehicules/:id
// ==========================================

exports.getVehiculeById = async (req, res) => {
    try {
        const { id } = req.params;
        const entrepriseId = req.user.entreprise;

        const vehicule = await Vehicule.findById(id);

        // Vérification de l'existence et cloisonnement multi-entreprise
        if (!vehicule || vehicule.entreprise.toString() !== entrepriseId.toString()) {
        return res.status(404).json({ message: 'Véhicule introuvable ou accès non autorisé.' });
        }

        res.status(200).json(vehicule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================================
// 4. [UPDATE] - Modifier un véhicule
// PUT /api/vehicules/:id
// ==========================================

exports.modifierVehicule = async (req, res) => {
    try {
        const { id } = req.params;
        const entrepriseId = req.user.entreprise;

        // Trouver d'abord le véhicule pour vérifier la propriété de l'entreprise
        let vehicule = await Vehicule.findById(id);

        if (!vehicule || vehicule.entreprise.toString() !== entrepriseId.toString()) {
        return res.status(404).json({ message: 'Véhicule introuvable ou accès non autorisé.' });
        }

        // Si l'immatriculation est modifiée, on la formate en majuscules
        if (req.body.immatriculation) {
        req.body.immatriculation = req.body.immatriculation.toUpperCase().trim();
        }

        // Mise à jour sécurisée
        vehicule = await Vehicule.findByIdAndUpdate(id, req.body, {
        new: true, // Renvoie le document modifié
        runValidators: true // Force Mongoose à valider les enums/types
        });

        res.status(200).json(vehicule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================================
// 5. [DELETE] - Supprimer ou archiver un véhicule
// DELETE /api/vehicules/:id
// ==========================================

exports.supprimerVehicule = async (req, res) => {
    try {
        const { id } = req.params;
        const entrepriseId = req.user.entreprise;

        const vehicule = await Vehicule.findById(id);

        if (!vehicule || vehicule.entreprise.toString() !== entrepriseId.toString()) {
        return res.status(404).json({ message: 'Véhicule introuvable ou accès non autorisé.' });
        }

        // 💡 LA SOLUTION ICI : On utilise le booléen que tu as créé dans ton schéma !
        vehicule.actif = false; 
        
        // On sauvegarde le changement sans toucher au 'statut' (il reste 'disponible' ou 'en_panne' en arrière-plan)
        await vehicule.save();

        res.status(200).json({ message: 'Véhicule archivé avec succès.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};