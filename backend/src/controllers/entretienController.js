const mongoose = require('mongoose');
const Entretien = require('../models/Entretien');
const Vehicule = require('../models/Vehicule');
const Affectation = require('../models/Affectation');
const repondreErreur = require('../utils/reponseErreur');

const accesVehiculesConducteur = async (req, entrepriseId) => {
    if (req.user.role !== 'conducteur') return null;
    const affectations = await Affectation.find({
        entreprise: entrepriseId,
        conducteur: req.user._id,
        statut: 'en_cours'
    }).select('vehicule');
    return affectations.map((item) => item.vehicule);
};

const verifierVehicule = async (vehicule, entrepriseId) =>
    Vehicule.exists({ _id: vehicule, entreprise: entrepriseId, actif: true });

exports.creerEntretien = async (req, res) => {
    try {
        const entrepriseId = req.user.entreprise;
        if (!await verifierVehicule(req.body.vehicule, entrepriseId)) {
            return res.status(400).json({ message: 'Le véhicule sélectionné est invalide pour cette entreprise.' });
        }
        const champs = ['vehicule', 'typeEntretien', 'statut', 'dateEntretien', 'kilometragePrevisionnel', 'kilometrageReel', 'cout', 'description'];
        const donnees = { entreprise: entrepriseId };
        champs.forEach((champ) => { if (req.body[champ] !== undefined) donnees[champ] = req.body[champ]; });
        const entretien = await Entretien.create(donnees);
        return res.status(201).json({ data: entretien });
    } catch (error) {
        return repondreErreur(res, error, 500, req);
    }
};

exports.getEntretiens = async (req, res) => {
    try {
        const entrepriseId = req.user.entreprise;
        const filtre = { entreprise: entrepriseId };
        const vehiculesConducteur = await accesVehiculesConducteur(req, entrepriseId);
        if (vehiculesConducteur) filtre.vehicule = { $in: vehiculesConducteur };
        if (req.query.statut) filtre.statut = req.query.statut;
        if (req.query.typeEntretien) filtre.typeEntretien = req.query.typeEntretien;
        if (req.query.vehicule) {
            if (!mongoose.isValidObjectId(req.query.vehicule)) {
                return res.status(400).json({ message: 'Le véhicule sélectionné est invalide.' });
            }
            if (vehiculesConducteur && !vehiculesConducteur.some((id) => String(id) === req.query.vehicule)) {
                return res.status(404).json({ message: 'Entretiens introuvables ou accès non autorisé.' });
            }
            filtre.vehicule = req.query.vehicule;
        }
        let page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        let limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const [data, totalItems] = await Promise.all([
            Entretien.find(filtre).populate('vehicule', 'marque modele immatriculation').sort({ dateEntretien: -1 }).skip((page - 1) * limit).limit(limit),
            Entretien.countDocuments(filtre)
        ]);
        return res.status(200).json({
            data,
            pagination: { totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: page, itemsPerPage: limit }
        });
    } catch (error) {
        return repondreErreur(res, error, 500, req);
    }
};

exports.getEntretienById = async (req, res) => {
    try {
        const filtre = { _id: req.params.id, entreprise: req.user.entreprise };
        const vehiculesConducteur = await accesVehiculesConducteur(req, req.user.entreprise);
        if (vehiculesConducteur) filtre.vehicule = { $in: vehiculesConducteur };
        const entretien = await Entretien.findOne(filtre).populate('vehicule', 'marque modele immatriculation');
        if (!entretien) return res.status(404).json({ message: 'Entretien introuvable ou accès non autorisé.' });
        return res.status(200).json({ data: entretien });
    } catch (error) {
        return repondreErreur(res, error, 500, req);
    }
};

exports.modifierEntretien = async (req, res) => {
    try {
        const donnees = {};
        ['vehicule', 'typeEntretien', 'statut', 'dateEntretien', 'kilometragePrevisionnel', 'kilometrageReel', 'cout', 'description']
            .forEach((champ) => { if (req.body[champ] !== undefined) donnees[champ] = req.body[champ]; });
        if (donnees.vehicule && !await verifierVehicule(donnees.vehicule, req.user.entreprise)) {
            return res.status(400).json({ message: 'Le véhicule sélectionné est invalide pour cette entreprise.' });
        }
        const entretien = await Entretien.findOneAndUpdate(
            { _id: req.params.id, entreprise: req.user.entreprise },
            donnees,
            { new: true, runValidators: true }
        ).populate('vehicule', 'marque modele immatriculation');
        if (!entretien) return res.status(404).json({ message: 'Entretien introuvable ou accès non autorisé.' });
        return res.status(200).json({ data: entretien });
    } catch (error) {
        return repondreErreur(res, error, 500, req);
    }
};

exports.supprimerEntretien = async (req, res) => {
    try {
        const entretien = await Entretien.findOneAndDelete({ _id: req.params.id, entreprise: req.user.entreprise });
        if (!entretien) return res.status(404).json({ message: 'Entretien introuvable ou accès non autorisé.' });
        return res.status(200).json({ message: 'Entretien supprimé.' });
    } catch (error) {
        return repondreErreur(res, error, 500, req);
    }
};
