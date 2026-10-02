const mongoose = require('mongoose');
const Depense = require('../models/Depense');
const Vehicule = require('../models/Vehicule');
const Affectation = require('../models/Affectation');
const repondreErreur = require('../utils/reponseErreur');

const categories = ['carburant', 'peages', 'assurances', 'leasing', 'entretien', 'reparation', 'autres'];
const champsDepense = ['vehicule', 'categorie', 'dateDepense', 'montant', 'kilometrage', 'litres', 'prixAuLitre', 'stationService', 'typeCarburant', 'description'];

async function filtreBase(req) {
    const filtre = { entreprise: req.user.entreprise };
    if (req.user.role !== 'conducteur') return filtre;
    const affectations = await Affectation.find({
        entreprise: req.user.entreprise,
        conducteur: req.user._id,
        statut: 'en_cours'
    }).select('vehicule');
    filtre.vehicule = { $in: affectations.map((item) => item.vehicule) };
    return filtre;
}

function ajouterFiltres(req, filtre) {
    if (req.query.vehicule) filtre.vehicule = req.query.vehicule;
    if (req.query.categorie) filtre.categorie = req.query.categorie;
    if (req.query.debut || req.query.fin) {
        filtre.dateDepense = {};
        if (req.query.debut) filtre.dateDepense.$gte = new Date(`${req.query.debut}T00:00:00.000Z`);
        if (req.query.fin) filtre.dateDepense.$lte = new Date(`${req.query.fin}T23:59:59.999Z`);
    }
}

async function verifierVehicule(id, entreprise) {
    return mongoose.isValidObjectId(id) && Vehicule.exists({ _id: id, entreprise, actif: true });
}

exports.creerDepense = async (req, res) => {
    try {
        if (!await verifierVehicule(req.body.vehicule, req.user.entreprise)) {
            return res.status(400).json({ message: 'Le véhicule sélectionné est invalide pour cette entreprise.' });
        }
        const donnees = { entreprise: req.user.entreprise };
        champsDepense.forEach((champ) => { if (req.body[champ] !== undefined) donnees[champ] = req.body[champ]; });
        const depense = await Depense.create(donnees);
        return res.status(201).json({ data: depense });
    } catch (error) {
        return repondreErreur(res, error, 500, req);
    }
};

exports.getDepenses = async (req, res) => {
    try {
        const filtre = await filtreBase(req);
        ajouterFiltres(req, filtre);
        if (filtre.vehicule && req.query.vehicule && !mongoose.isValidObjectId(req.query.vehicule)) {
            return res.status(400).json({ message: 'Le véhicule sélectionné est invalide.' });
        }
        if (req.query.categorie && !categories.includes(req.query.categorie)) {
            return res.status(400).json({ message: 'La catégorie est invalide.' });
        }
        let page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
        const [data, totalItems] = await Promise.all([
            Depense.find(filtre).populate('vehicule', 'marque modele immatriculation').sort({ dateDepense: -1 }).skip((page - 1) * limit).limit(limit),
            Depense.countDocuments(filtre)
        ]);
        return res.status(200).json({
            data,
            pagination: { totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: page, itemsPerPage: limit }
        });
    } catch (error) {
        return repondreErreur(res, error, 500, req);
    }
};

exports.getDepensesOverview = async (req, res) => {
    try {
        const filtre = await filtreBase(req);
        ajouterFiltres(req, filtre);
        if (req.query.vehicule && !mongoose.isValidObjectId(req.query.vehicule)) {
            return res.status(400).json({ message: 'Le véhicule sélectionné est invalide.' });
        }
        if (req.query.categorie && !categories.includes(req.query.categorie)) {
            return res.status(400).json({ message: 'La catégorie est invalide.' });
        }
        const [parCategorie, parMois, parVehicule, totalResult] = await Promise.all([
            Depense.aggregate([{ $match: filtre }, { $group: { _id: '$categorie', total: { $sum: '$montant' } } }, { $sort: { total: -1 } }]),
            Depense.aggregate([{ $match: filtre }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$dateDepense' } }, total: { $sum: '$montant' } } }, { $sort: { _id: 1 } }]),
            Depense.aggregate([{ $match: filtre }, { $group: { _id: '$vehicule', total: { $sum: '$montant' }, minimumKm: { $min: '$kilometrage' }, maximumKm: { $max: '$kilometrage' } } }, { $sort: { total: -1 } }]),
            Depense.aggregate([{ $match: filtre }, { $group: { _id: null, total: { $sum: '$montant' } } }])
        ]);
        const total = totalResult[0]?.total || 0;
        const kilometres = parVehicule.reduce((sum, item) => sum + (
            Number.isFinite(item.minimumKm) && Number.isFinite(item.maximumKm) && item.maximumKm >= item.minimumKm
                ? item.maximumKm - item.minimumKm
                : 0
        ), 0);
        const debut = req.query.debut ? new Date(`${req.query.debut}T00:00:00.000Z`) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const precedentDebut = new Date(debut);
        precedentDebut.setMonth(precedentDebut.getMonth() - 1);
        const precedentFin = new Date(debut);
        const fin = req.query.fin ? new Date(`${req.query.fin}T23:59:59.999Z`) : new Date();
        const precedentFiltre = { ...filtre, dateDepense: { $gte: precedentDebut, $lt: precedentFin } };
        const precedent = await Depense.aggregate([{ $match: precedentFiltre }, { $group: { _id: null, total: { $sum: '$montant' } } }]);
        return res.status(200).json({
            data: {
                total,
                moyenneParVehicule: parVehicule.length ? total / parVehicule.length : 0,
                coutParKilometre: kilometres ? total / kilometres : 0,
                precedentTotal: precedent[0]?.total || 0,
                parCategorie,
                parMois,
                parVehicule
            }
        });
    } catch (error) {
        return repondreErreur(res, error, 500, req);
    }
};

exports.getCarburantOverview = async (req, res) => {
    try {
        const filtre = await filtreBase(req);
        filtre.categorie = 'carburant';
        ajouterFiltres(req, filtre);
        const pleins = await Depense.find(filtre)
            .populate('vehicule', 'marque modele immatriculation')
            .sort({ vehicule: 1, kilometrage: 1, dateDepense: 1 });
        const parVehicule = new Map();
        const data = pleins.map((plein) => {
            const key = String(plein.vehicule?._id || plein.vehicule);
            const precedents = parVehicule.get(key) || [];
            const precedent = precedents[precedents.length - 1];
            const distance = precedent?.kilometrage != null && plein.kilometrage != null
                ? plein.kilometrage - precedent.kilometrage
                : 0;
            const consommation = distance > 0 && plein.litres != null ? (plein.litres / distance) * 100 : null;
            const coutParKilometre = distance > 0 ? plein.montant / distance : null;
            precedents.push(plein);
            parVehicule.set(key, precedents);
            return {
                ...plein.toObject(),
                consommationMoyenne: consommation,
                coutCarburantParKilometre: coutParKilometre,
                consommationInhabituelle: consommation !== null && consommation > 12
            };
        });
        const parVehiculeData = [...parVehicule.entries()].map(([vehicule, items]) => {
            const mesures = items.slice(1);
            const distance = mesures.reduce((total, item, index) => total + (
                item.kilometrage != null && items[index].kilometrage != null
                    ? Math.max(item.kilometrage - items[index].kilometrage, 0)
                    : 0
            ), 0);
            const litres = mesures.reduce((total, item) => total + (Number(item.litres) || 0), 0);
            const montant = items.reduce((total, item) => total + (Number(item.montant) || 0), 0);
            return {
                vehicule,
                libelle: items[0].vehicule?.immatriculation || 'Véhicule indisponible',
                consommationMoyenne: distance > 0 ? (litres / distance) * 100 : null,
                coutParKilometre: distance > 0 ? montant / distance : null
            };
        });
        return res.status(200).json({ data: { pleins: data, parVehicule: parVehiculeData, seuilAlerte: 12 } });
    } catch (error) {
        return repondreErreur(res, error, 500, req);
    }
};

exports.modifierDepense = async (req, res) => {
    try {
        const donnees = {};
        champsDepense
            .forEach((champ) => { if (req.body[champ] !== undefined) donnees[champ] = req.body[champ]; });
        if (donnees.vehicule && !await verifierVehicule(donnees.vehicule, req.user.entreprise)) {
            return res.status(400).json({ message: 'Le véhicule sélectionné est invalide pour cette entreprise.' });
        }
        const depense = await Depense.findOneAndUpdate({ _id: req.params.id, entreprise: req.user.entreprise }, donnees, { new: true, runValidators: true }).populate('vehicule', 'marque modele immatriculation');
        if (!depense) return res.status(404).json({ message: 'Dépense introuvable ou accès non autorisé.' });
        return res.status(200).json({ data: depense });
    } catch (error) {
        return repondreErreur(res, error, 500, req);
    }
};

exports.supprimerDepense = async (req, res) => {
    try {
        const depense = await Depense.findOneAndDelete({ _id: req.params.id, entreprise: req.user.entreprise });
        if (!depense) return res.status(404).json({ message: 'Dépense introuvable ou accès non autorisé.' });
        return res.status(200).json({ message: 'Dépense supprimée.' });
    } catch (error) {
        return repondreErreur(res, error, 500, req);
    }
};
