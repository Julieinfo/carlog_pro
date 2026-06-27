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
// GET /api/vehicules (Récupérer les véhicules avec PAGINATION)
// ==========================================
// ==========================================
// GET /api/vehicules (Avec PAGINATION + RECHERCHE + FILTRES)
// ==========================================
exports.getVehicules = async (req, res) => {
    try {
        const entrepriseId = req.user.entreprise;

        // 1. Initialisation de la requête de base (Sécurité Multi-tenant obligatoire)
        let filtres = { entreprise: entrepriseId, actif: true }; // On ne récupère que les véhicules actifs

        // 2. Extraction des filtres de recherche depuis l'URL
        const { search, typeVehicule, statut } = req.query;

        // Logique de recherche textuelle (Recherche insensible à la casse avec Regex)
        if (search) {
            filtres.$or = [
                { immatriculation: { $regex: search, $options: 'i' } },
                { marque: { $regex: search, $options: 'i' } },
                { modele: { $regex: search, $options: 'i' } }
            ];
        }

        // Filtrage par type exact (ex: ?type=Poids-lourd)
        if (typeVehicule) {
            filtres.typeVehicule = typeVehicule; // Assurez-vous que le nom du champ correspond à votre schéma
        }

        // Filtrage par statut exact (ex: ?statut=Disponible)
        if (statut) {
            filtres.statut = statut;
        }

        // 3. Gestion de la pagination habituelle
        let page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 10) || 10;
        if (page < 1) page = 1;
        if (limit < 1) limit = 1;
        if (limit > 100) limit = 100;

        const skip = (page - 1) * limit;

        // 4. Exécution de la requête avec les filtres dynamiques appliqués
        const [vehicules, totalVehicules] = await Promise.all([
            Vehicule.find(filtres) // On passe l'objet de filtres ici
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            
            Vehicule.countDocuments(filtres) // On compte en prenant en compte les filtres !
        ]);

        res.status(200).json({
            pagination: {
                totalItems: totalVehicules,
                totalPages: Math.ceil(totalVehicules / limit),
                currentPage: page,
                itemsPerPage: limit
            },
            data: vehicules
        });

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