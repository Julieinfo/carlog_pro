// Import du modele Mongoose pour les affectations.
// C'est ce modele qui definit la structure des donnees dans MongoDB.
const mongoose = require('mongoose');
const Affectation = require('../models/Affectation');
const Vehicule = require('../models/Vehicule');
const User = require('../models/User');
const repondreErreur = require('../utils/reponseErreur');

// ==========================================
// GET /api/affectations (Récupérer toutes les affectations de l'entreprise)
// ==========================================

/**
 * Recupere toutes les affectations de l'entreprise de l'utilisateur connecte.
 * Role : afficher la liste complete des affectations pour le dashboard.
 * Parametres : aucun (utilise req.user.entreprise depuis le token JWT)
 * Valeur de retour : tableau d'objets affectation avec les details vehicule et conducteur
 */
exports.getAffectations = async (req, res) => {
    try {
        // Securite multi-tenant : on ne recupere QUE les affectations de l'entreprise de l'utilisateur connecte.
        // C'est crucial pour empecher une entreprise de voir les donnees d'une autre.
        // L'entrepriseId vient du token JWT decode dans le middleware d'authentification.
        const entrepriseId = req.user.entreprise;

        // Requete avec populate : ca permet de recuperer les details des references (vehicule, conducteur)
        // au lieu d'avoir juste les IDs. J'ai choisi de ne recuperer que certains champs pour alleger la reponse.
        // J'aurais pu faire une requete separee pour chaque reference, mais populate est plus performant.
        const filtre = { entreprise: entrepriseId };
        // Un conducteur ne doit pas pouvoir parcourir les affectations de ses collegues.
        if (req.user.role === 'conducteur') {
            filtre.conducteur = req.user._id;
        }

        const affectations = await Affectation.find(filtre)
        .populate('vehicule', 'marque modele immatriculation') // optionnel: pour embarquer les détails du véhicule
        .populate('conducteur', 'nom prenom email')            // optionnel: pour embarquer les détails du chauffeur
        .sort({ dateDebut: -1 }); // Les plus récentes en premier

        res.status(200).json(affectations);
    } catch (err) {
        // En cas d'erreur, on renvoie un 500 avec le message d'erreur.
        // En prod, on devrait logger l'erreur et renvoyer un message plus genérique pour ne pas exposer les details techniques.
        repondreErreur(res, err);
    }
};

// ==========================================
// POST /api/affectations (Créer une nouvelle affectation)
// ==========================================

/**
 * Cree une nouvelle affectation de vehicule a un conducteur.
 * Role : permettre l'attribution d'un vehicule pour une mission.
 * Parametres : vehicule (ID), conducteur (ID), dateDebut (optionnel), kmDebut (obligatoire), observations (optionnel)
 * Valeur de retour : l'objet affectation cree avec statut 'en_cours'
 */
exports.creerAffectation = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const entrepriseId = req.user.entreprise;
        const { vehicule, conducteur, dateDebut, kmDebut, observations } = req.body;

        // 1. Verification basique des champs obligatoires.
        // J'ai choisi de faire cette verification ici plutot que dans un middleware pour garder la logique metier au meme endroit.
        // Ca pourrait etre deplace dans un validator middleware si l'application grossit.
        if (!vehicule || !conducteur || kmDebut === undefined || kmDebut === null) {
        return res.status(400).json({ message: 'Veuillez fournir le véhicule, le conducteur et le kilométrage de départ.' });
        }

        let nouvelleAffectation;
        await session.withTransaction(async () => {
            const vehiculeDocument = await Vehicule.findOne({ _id: vehicule, entreprise: entrepriseId, actif: true }).session(session);
            if (!vehiculeDocument) throw Object.assign(new Error('Véhicule introuvable, archivé ou rattaché à une autre entreprise.'), { status: 400 });
            if (['en_panne', 'en_maintenance'].includes(vehiculeDocument.statut)) throw Object.assign(new Error('Ce véhicule ne peut pas être affecté dans son état actuel.'), { status: 400 });

            const conducteurDocument = await User.findOne({ _id: conducteur, entreprise: entrepriseId, role: 'conducteur', actif: true }).session(session);
            if (!conducteurDocument) throw Object.assign(new Error('Conducteur introuvable, inactif ou rattaché à une autre entreprise.'), { status: 400 });

            const conflit = await Affectation.findOne({
                entreprise: entrepriseId,
                $or: [{ vehicule }, { conducteur }],
                statut: 'en_cours'
            }).session(session);
            if (conflit) throw Object.assign(new Error('Ce véhicule ou ce conducteur possède déjà une affectation en cours.'), { status: 400 });

            [nouvelleAffectation] = await Affectation.create([{
                entreprise: entrepriseId,
                vehicule,
                conducteur,
                dateDebut: dateDebut || Date.now(),
                kmDebut,
                observations,
                statut: 'en_cours'
            }], { session });

            vehiculeDocument.statut = 'en_course';
            await vehiculeDocument.save({ session });
        });

        res.status(201).json(nouvelleAffectation);
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: 'Ce véhicule ou ce conducteur possède déjà une affectation en cours.' });
        if (err.status) return res.status(err.status).json({ message: err.message });
        repondreErreur(res, err);
    } finally {
        await session.endSession();
    }
};

// ==========================================
// GET /api/affectations/:id (Lire une seule affectation - Sécurisée)
// ==========================================

/**
 * Recupere une affectation specifique par son ID.
 * Role : afficher les details d'une affectation pour consultation ou modification.
 * Parametres : id (dans l'URL)
 * Valeur de retour : l'objet affectation avec les details conducteur et vehicule
 */
exports.getAffectationById = async (req, res) => {
    try {
        const entrepriseId = req.user.entreprise;

        // Securisation multi-tenant : l'affectation doit appartenir a l'entreprise de l'user.
        // J'utilise findOne avec deux criteres (_id et entreprise) au lieu de findById + verification,
        // car c'est plus performant (une seule requete) et plus securise (pas de race condition).
        const filtre = { _id: req.params.id, entreprise: entrepriseId };
        if (req.user.role === 'conducteur') {
            filtre.conducteur = req.user._id;
        }

        const affectation = await Affectation.findOne(filtre)
            .populate('conducteur', 'nom prenom email')
            .populate('vehicule', 'immatriculation marque modele');

        if (!affectation) {
            return res.status(404).json({ message: 'Affectation introuvable ou accès refusé.' });
        }

        res.status(200).json(affectation);
    } catch (err) {
        repondreErreur(res, err);
    }
};

// ==========================================
// PUT /api/affectations/:id (Modifier une affectation - Sécurisée)
// ==========================================

/**
 * Modifie une affectation existante.
 * Role : permettre la correction d'informations dans une affectation en cours.
 * Parametres : id (dans l'URL), champs a modifier (dans le body)
 * Valeur de retour : l'objet affectation modifie
 */
exports.modifierAffectation = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const entrepriseId = req.user.entreprise;

        // Securisation multi-tenant : on filtre par ID ET par entreprise.
        // findOneAndUpdate est parfait pour ca : il fait la recherche et la mise a jour en une seule operation atomique.
        // new: true renvoie le document modifie (pas l'ancien).
        // runValidators: true est important pour que les validations du schema Mongoose s'appliquent meme sur update.
        // CORRECTION SÉCURITÉ : Filtrage des champs autorisés pour empêcher la modification de champs sensibles.
        // Avant : req.body était passé directement à findOneAndUpdate, permettant à un utilisateur malveillant
        // de modifier des champs critiques comme 'entreprise', 'statut', ou tout autre champ non prévu.
        // Risque : Un utilisateur pourrait modifier l'entreprise pour accéder aux affectations d'une autre entreprise.
        // Maintenant : On extrait uniquement les champs autorisés de manière explicite (whitelist statique)
        // pour éviter toute injection de propriété distante (remote property injection).
        const donneesValides = {
            ...(req.body.vehicule !== undefined && { vehicule: req.body.vehicule }),
            ...(req.body.conducteur !== undefined && { conducteur: req.body.conducteur }),
            ...(req.body.dateDebut !== undefined && { dateDebut: req.body.dateDebut }),
            ...(req.body.kmDebut !== undefined && { kmDebut: req.body.kmDebut }),
            ...(req.body.observations !== undefined && { observations: req.body.observations }),
            ...(req.body.dateFin !== undefined && { dateFin: req.body.dateFin }),
            ...(req.body.kmFin !== undefined && { kmFin: req.body.kmFin })
        };

        let affectationModifiee;
        await session.withTransaction(async () => {
            const filtreAffectation = { _id: req.params.id, entreprise: entrepriseId };
            const affectationExistante = await Affectation.findOne(filtreAffectation).session(session);
            if (!affectationExistante) {
                throw Object.assign(new Error('Affectation introuvable ou accès refusé.'), { status: 404 });
            }

            const vehiculeChange = req.body.vehicule !== undefined &&
                String(req.body.vehicule) !== String(affectationExistante.vehicule);
            const conducteurChange = req.body.conducteur !== undefined &&
                String(req.body.conducteur) !== String(affectationExistante.conducteur);

            if (req.body.vehicule !== undefined) {
                const vehiculeValide = await Vehicule.exists({ _id: req.body.vehicule, entreprise: entrepriseId, actif: true }).session(session);
                if (!vehiculeValide) {
                    throw Object.assign(new Error('Le véhicule sélectionné est invalide pour cette entreprise.'), { status: 400 });
                }
            }
            if (req.body.conducteur !== undefined) {
                const conducteurValide = await User.exists({ _id: req.body.conducteur, entreprise: entrepriseId, role: 'conducteur', actif: true }).session(session);
                if (!conducteurValide) {
                    throw Object.assign(new Error('Le conducteur sélectionné est invalide pour cette entreprise.'), { status: 400 });
                }
            }

            if (affectationExistante.statut === 'en_cours' && (vehiculeChange || conducteurChange)) {
                const vehiculeCible = req.body.vehicule !== undefined ? req.body.vehicule : affectationExistante.vehicule;
                const conducteurCible = req.body.conducteur !== undefined ? req.body.conducteur : affectationExistante.conducteur;
                const conflit = await Affectation.findOne({
                    entreprise: entrepriseId,
                    _id: { $ne: req.params.id },
                    statut: 'en_cours',
                    $or: [{ vehicule: vehiculeCible }, { conducteur: conducteurCible }]
                }).session(session);
                if (conflit) {
                    throw Object.assign(new Error('Ce véhicule ou ce conducteur possède déjà une affectation en cours.'), { status: 409 });
                }
            }

            if (vehiculeChange && affectationExistante.statut === 'en_cours') {
                const nouveauVehicule = await Vehicule.findOne({
                    _id: req.body.vehicule,
                    entreprise: entrepriseId,
                    actif: true
                }).session(session);
                if (!nouveauVehicule) {
                    throw Object.assign(new Error('Le véhicule sélectionné est invalide pour cette entreprise.'), { status: 400 });
                }
                if (['en_panne', 'en_maintenance'].includes(nouveauVehicule.statut)) {
                    throw Object.assign(new Error('Ce véhicule ne peut pas être affecté dans son état actuel.'), { status: 400 });
                }

                const ancienVehicule = await Vehicule.findOne({
                    _id: affectationExistante.vehicule,
                    entreprise: entrepriseId
                }).session(session);
                if (ancienVehicule) {
                    ancienVehicule.statut = 'disponible';
                    await ancienVehicule.save({ session });
                }
                nouveauVehicule.statut = 'en_course';
                await nouveauVehicule.save({ session });
            }

            affectationModifiee = await Affectation.findOneAndUpdate(
                filtreAffectation,
                donneesValides,
                { new: true, runValidators: true, session }
            );

            if (!affectationModifiee) {
                throw Object.assign(new Error('Affectation introuvable ou accès refusé.'), { status: 404 });
            }
        });

        res.status(200).json({ message: 'Affectation mise à jour avec succès.', affectation: affectationModifiee });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: 'Ce véhicule ou ce conducteur possède déjà une affectation en cours.' });
        if (err.status) return res.status(err.status).json({ message: err.message });
        repondreErreur(res, err);
    } finally {
        await session.endSession();
    }
};

// ==========================================
// PUT /api/affectations/:id/terminer (Clore proprement une affectation pour l'historique)
// ==========================================

/**
 * Cloture une affectation en cours et l'archive dans l'historique.
 * Role : permettre de terminer proprement une mission avec le kilometrage final.
 * Parametres : id (dans l'URL), dateFin (optionnel), kmFin (obligatoire), observationsFin (optionnel)
 * Valeur de retour : l'objet affectation avec statut 'terminee'
 */
exports.terminerAffectation = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const entrepriseId = req.user.entreprise;
        const { dateFin, kmFin, observationsFin } = req.body;

        // Le kilometrage de fin est obligatoire car c'est essentiel pour le suivi de l'usure des vehicules.
        // J'ai choisi de le rendre obligatoire ici plutot que dans le schema pour avoir un message d'erreur plus clair.
        if (kmFin === undefined || kmFin === null) {
            return res.status(400).json({ message: 'Le kilométrage de fin est obligatoire pour clore l\'affectation.' });
        }

        // On cherche l'affectation active appartenant a l'entreprise.
        const affectation = await Affectation.findOne({ _id: req.params.id, entreprise: entrepriseId }).session(session);

        if (!affectation) {
            return res.status(404).json({ message: 'Affectation introuvable ou accès refusé.' });
        }

        // On verifie que l'affectation n'est pas deja cloturee pour eviter les doublons dans l'historique.
        if (affectation.statut === 'terminee') {
            return res.status(400).json({ message: 'Cette affectation est déjà clôturée.' });
        }

        // Regle metier : Le kilometrage de fin ne peut pas etre inferieur au kilometrage de depart.
        // C'est une verification de coherence pour eviter les erreurs de saisie.
        // J'aurais pu aussi verifier que kmFin n'est pas trop eleve (ex: +1000km en 1h), mais c'est plus complexe a mettre en place.
        if (kmFin < affectation.kmDebut) {
            return res.status(400).json({ 
                message: `Le kilométrage de fin (${kmFin} km) ne peut pas être inférieur au kilométrage de départ (${affectation.kmDebut} km).` 
            });
        }

        await session.withTransaction(async () => {
            affectation.statut = 'terminee';
            affectation.dateFin = dateFin || Date.now();
            affectation.kmFin = kmFin;
            if (observationsFin) affectation.observations = `${affectation.observations || ''} | Fin: ${observationsFin}`;
            await affectation.save({ session });

            const vehicule = await Vehicule.findOne({ _id: affectation.vehicule, entreprise: entrepriseId }).session(session);
            if (vehicule) {
                vehicule.statut = 'disponible';
                if (kmFin > vehicule.kilometrage) vehicule.kilometrage = kmFin;
                await vehicule.save({ session });
            }
        });

        res.status(200).json({ message: 'Affectation clôturée avec succès et archivée dans l\'historique.', affectation });
    } catch (err) {
        if (err.status) return res.status(err.status).json({ message: err.message });
        repondreErreur(res, err);
    } finally {
        await session.endSession();
    }
};

// ==========================================
// DELETE /api/affectations/:id (Supprimer une affectation - Sécurisée)
// ==========================================

/**
 * Supprime une affectation de la base de donnees.
 * Role : permettre la suppression d'une affectation (en cas d'erreur de creation par exemple).
 * Parametres : id (dans l'URL)
 * Valeur de retour : message de confirmation
 */
exports.supprimerAffectation = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const entrepriseId = req.user.entreprise;
        await session.withTransaction(async () => {
            const affectationSupprimee = await Affectation.findOneAndDelete(
                { _id: req.params.id, entreprise: entrepriseId },
                { session }
            );

            if (!affectationSupprimee) {
                throw Object.assign(new Error('Affectation introuvable ou accès refusé.'), { status: 404 });
            }

            if (affectationSupprimee.statut === 'en_cours') {
                const vehicule = await Vehicule.findOne({
                    _id: affectationSupprimee.vehicule,
                    entreprise: entrepriseId
                }).session(session);
                if (vehicule) {
                    vehicule.statut = 'disponible';
                    await vehicule.save({ session });
                }
            }
        });

        res.status(200).json({ message: 'Affectation supprimée avec succès.' });
    } catch (err) {
        if (err.status) return res.status(err.status).json({ message: err.message });
        repondreErreur(res, err);
    } finally {
        await session.endSession();
    }
};
