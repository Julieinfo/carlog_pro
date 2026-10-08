const fs = require('node:fs/promises');
const Document = require('../models/Document');
const Vehicule = require('../models/Vehicule');
const repondreErreur = require('../utils/reponseErreur');

const champs = ['vehicule', 'typeDocument', 'reference', 'prestataire', 'dateDebut', 'dateEcheance', 'cout'];
const joursAvantAlerte = 30;

function statutCalcule(document) {
    if (document.statut === 'archive') return 'archive';
    const echeance = new Date(document.dateEcheance);
    const maintenant = new Date();
    const dansTrenteJours = new Date(maintenant);
    dansTrenteJours.setDate(dansTrenteJours.getDate() + joursAvantAlerte);
    if (echeance < maintenant) return 'expire';
    if (echeance <= dansTrenteJours) return echeance.getTime() - maintenant.getTime() <= 7 * 86400000 ? 'urgent' : 'a_renouveler';
    return 'actif';
}

function enrichir(document) {
    const data = document.toObject ? document.toObject() : document;
    return { ...data, statut: statutCalcule(data), alerteEcheance: statutCalcule(data) !== 'actif' && statutCalcule(data) !== 'archive' };
}

async function verifierVehicule(id, entreprise) {
    return Vehicule.exists({ _id: id, entreprise, actif: true });
}

exports.getDocuments = async (req, res) => {
    try {
        const filtre = { entreprise: req.user.entreprise };
        if (req.query.vehicule) filtre.vehicule = req.query.vehicule;
        if (req.query.typeDocument) filtre.typeDocument = req.query.typeDocument;
        if (req.query.statut === 'archive') filtre.statut = 'archive';
        else if (req.query.statut) {
            const documents = await Document.find(filtre).populate('vehicule', 'marque modele immatriculation').sort({ dateEcheance: 1 });
            return res.json({ data: documents.map(enrichir).filter((item) => item.statut === req.query.statut) });
        } else filtre.statut = { $ne: 'archive' };
        const documents = await Document.find(filtre).populate('vehicule', 'marque modele immatriculation').sort({ dateEcheance: 1 });
        return res.json({ data: documents.map(enrichir) });
    } catch (error) {
        return repondreErreur(res, error, 500, req);
    }
};

exports.getDocument = async (req, res) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, entreprise: req.user.entreprise }).populate('vehicule', 'marque modele immatriculation');
        if (!document) return res.status(404).json({ message: 'Document introuvable ou accès non autorisé.' });
        return res.json({ data: enrichir(document) });
    } catch (error) {
        return repondreErreur(res, error, 500, req);
    }
};

exports.creerDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Le fichier est obligatoire.' });
        if (!await verifierVehicule(req.body.vehicule, req.user.entreprise)) {
            await fs.unlink(req.file.path).catch(() => {});
            return res.status(400).json({ message: 'Le véhicule sélectionné est invalide pour cette entreprise.' });
        }
        const donnees = { entreprise: req.user.entreprise, ...Object.fromEntries(champs.map((champ) => [champ, req.body[champ]])), nomOriginal: req.file.originalname, nomFichier: req.file.filename, cheminFichier: req.file.path, mimeType: req.file.mimetype, taille: req.file.size };
        const document = await Document.create(donnees);
        return res.status(201).json({ data: enrichir(document) });
    } catch (error) {
        if (req.file) await fs.unlink(req.file.path).catch(() => {});
        return repondreErreur(res, error, 500, req);
    }
};

exports.modifierDocument = async (req, res) => {
    try {
        const donnees = {};
        champs.forEach((champ) => { if (req.body[champ] !== undefined) donnees[champ] = req.body[champ]; });
        if (req.body.statut !== undefined) donnees.statut = req.body.statut;
        if (donnees.vehicule && !await verifierVehicule(donnees.vehicule, req.user.entreprise)) return res.status(400).json({ message: 'Le véhicule sélectionné est invalide pour cette entreprise.' });
        const document = await Document.findOneAndUpdate({ _id: req.params.id, entreprise: req.user.entreprise }, donnees, { new: true, runValidators: true }).populate('vehicule', 'marque modele immatriculation');
        if (!document) return res.status(404).json({ message: 'Document introuvable ou accès non autorisé.' });
        return res.json({ data: enrichir(document) });
    } catch (error) {
        return repondreErreur(res, error, 500, req);
    }
};

exports.telechargerDocument = async (req, res) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, entreprise: req.user.entreprise });
        if (!document) return res.status(404).json({ message: 'Document introuvable ou accès non autorisé.' });
        return res.download(document.cheminFichier, document.nomOriginal);
    } catch (error) {
        return repondreErreur(res, error, 404, req);
    }
};

exports.apercuDocument = async (req, res) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, entreprise: req.user.entreprise });
        if (!document) return res.status(404).json({ message: 'Document introuvable ou accès non autorisé.' });
        res.type(document.mimeType);
        return res.sendFile(document.cheminFichier);
    } catch (error) {
        return repondreErreur(res, error, 404, req);
    }
};

exports.supprimerDocument = async (req, res) => {
    try {
        const document = await Document.findOneAndDelete({ _id: req.params.id, entreprise: req.user.entreprise });
        if (!document) return res.status(404).json({ message: 'Document introuvable ou accès non autorisé.' });
        await fs.unlink(document.cheminFichier).catch(() => {});
        return res.json({ message: 'Document supprimé.' });
    } catch (error) {
        return repondreErreur(res, error, 500, req);
    }
};
