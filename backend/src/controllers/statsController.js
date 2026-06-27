const mongoose = require('mongoose');
const Vehicule = require('../models/Vehicule');
const Affectation = require('../models/Affectation');

// ==========================================
// GET /api/stats (Récupérer les KPI du tableau de bord)
// ==========================================
exports.getDashboardStats = async (req, res) => {
    try {
        const entrepriseId = new mongoose.Types.ObjectId(req.user.entreprise); // Assurez-vous que l'ID est au format ObjectId

        // 1. Agrégation Mongoose pour grouper et compter les véhicules par statut
        const statsVehicules = await Vehicule.aggregate([
            { $match: { entreprise: entrepriseId } }, // Multi-tenant : uniquement l'entreprise courante
            {
                $group: {
                    _id: '$statut', // On groupe par le champ 'statut'
                    total: { $sum: 1 } // On incrémente de 1 pour chaque véhicule trouvé
                }
            }
        ]);

        // Formater le résultat de l'agrégation pour le rendre plus propre (clé-valeur)
        const vehiculesParStatut = {
            total: 0,
            disponible: 0,
            en_course: 0,
            maintenance: 0,
            en_panne: 0
        };

        statsVehicules.forEach(stat => {
            const statutFormate = stat._id; // ex: 'disponible'
            if (statutFormate in vehiculesParStatut) {
                vehiculesParStatut[statutFormate] = stat.total;
            }
            vehiculesParStatut.total += stat.total;
        });

        // 2. Compter le nombre d'affectations actives (en cours)
        const affectationsActives = await Affectation.countDocuments({
            entreprise: entrepriseId,
            statut: 'en_cours'
        });

        // 3. Envoyer la réponse consolidée au Front-end
        res.status(200).json({
            vehicules: vehiculesParStatut,
            missions: {
                enCours: affectationsActives
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};