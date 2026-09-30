const User = require('../models/User');
const repondreErreur = require('../utils/reponseErreur');

const rolesEntreprise = ['admin', 'fleet_manager', 'conducteur', 'mecanicien', 'comptable'];

const sansMotDePasse = (user) => {
    const donnees = user.toObject ? user.toObject() : user;
    delete donnees.motDePasse;
    return donnees;
};

exports.getUtilisateurs = async (req, res) => {
    try {
        const utilisateurs = await User.find({ entreprise: req.user.entreprise })
            .select('-motDePasse')
            .sort({ nom: 1, prenom: 1 });
        res.status(200).json(utilisateurs);
    } catch (err) {
        repondreErreur(res, err, 500, req);
    }
};

exports.creerUtilisateur = async (req, res) => {
    try {
        const { nom, prenom, email, telephone, motDePasse, role } = req.body;

        if (!nom || !prenom || !email || !motDePasse || !role) {
            return res.status(400).json({ message: 'Le nom, le prénom, l\'email, le mot de passe initial et le rôle sont obligatoires.' });
        }
        if (!rolesEntreprise.includes(role)) {
            return res.status(400).json({ message: 'Le rôle sélectionné est invalide.' });
        }
        if (motDePasse.length < 8) {
            return res.status(400).json({ message: 'Le mot de passe initial doit contenir au moins 8 caractères.' });
        }
        if (await User.findOne({ email: email.toLowerCase().trim() })) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        const utilisateur = await User.create({
            nom,
            prenom,
            email: email.toLowerCase().trim(),
            telephone,
            motDePasse,
            role,
            typeCompte: 'entreprise',
            entreprise: req.user.entreprise
        });

        res.status(201).json(sansMotDePasse(utilisateur));
    } catch (err) {
        repondreErreur(res, err, 500, req);
    }
};

exports.desactiverUtilisateur = async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'Vous ne pouvez pas désactiver votre propre compte.' });
        }

        const utilisateur = await User.findOne({ _id: req.params.id, entreprise: req.user.entreprise }).select('role');
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur introuvable ou accès refusé.' });
        }
        if (utilisateur.role === 'admin') {
            return res.status(403).json({ message: 'Un administrateur ne peut pas désactiver un autre administrateur.' });
        }

        const utilisateurDesactive = await User.findOneAndUpdate(
            { _id: req.params.id, entreprise: req.user.entreprise },
            { actif: false },
            { new: true }
        ).select('-motDePasse');

        if (!utilisateurDesactive) {
            return res.status(404).json({ message: 'Utilisateur introuvable ou accès refusé.' });
        }
        res.status(200).json(sansMotDePasse(utilisateurDesactive));
    } catch (err) {
        repondreErreur(res, err, 500, req);
    }
};

exports.modifierUtilisateur = async (req, res) => {
    try {
        const estRoleFourni = Object.prototype.hasOwnProperty.call(req.body, 'role');
        const estUtilisateurConnecte = req.params.id === req.user._id.toString();
        if (estRoleFourni && estUtilisateurConnecte) {
            return res.status(403).json({ message: 'Vous ne pouvez pas modifier votre propre rôle.' });
        }

        const utilisateur = await User.findOne({ _id: req.params.id, entreprise: req.user.entreprise }).select('role');
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur introuvable ou accès refusé.' });
        }

        const champsModifiables = ['nom', 'prenom', 'email', 'telephone', 'role'];
        const modifications = {};
        for (const champ of champsModifiables) {
            if (Object.prototype.hasOwnProperty.call(req.body, champ)) modifications[champ] = req.body[champ];
        }
        if (!Object.keys(modifications).length) {
            return res.status(400).json({ message: 'Aucune information valide à modifier.' });
        }
        if (modifications.role && !rolesEntreprise.includes(modifications.role)) {
            return res.status(400).json({ message: 'Le rôle sélectionné est invalide.' });
        }
        if (modifications.email !== undefined) {
            if (typeof modifications.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(modifications.email.trim())) {
                return res.status(400).json({ message: 'Le format de l’email est invalide.' });
            }
            modifications.email = modifications.email.toLowerCase().trim();
            const emailExistant = await User.findOne({ email: modifications.email, _id: { $ne: req.params.id } });
            if (emailExistant) return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }
        for (const champ of ['nom', 'prenom']) {
            if (modifications[champ] !== undefined && (typeof modifications[champ] !== 'string' || !modifications[champ].trim())) {
                return res.status(400).json({ message: `Le champ ${champ} est obligatoire.` });
            }
            if (typeof modifications[champ] === 'string') modifications[champ] = modifications[champ].trim();
        }

        const utilisateurModifie = await User.findOneAndUpdate(
            { _id: req.params.id, entreprise: req.user.entreprise },
            modifications,
            { new: true, runValidators: true }
        ).select('-motDePasse');
        if (!utilisateurModifie) return res.status(404).json({ message: 'Utilisateur introuvable ou accès refusé.' });
        return res.status(200).json(sansMotDePasse(utilisateurModifie));
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        repondreErreur(res, err, 500, req);
    }
};

exports.reactiverUtilisateur = async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'Vous ne pouvez pas modifier le statut de votre propre compte.' });
        }
        const utilisateur = await User.findOneAndUpdate(
            { _id: req.params.id, entreprise: req.user.entreprise },
            { actif: true },
            { new: true }
        ).select('-motDePasse');
        if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable ou accès refusé.' });
        return res.status(200).json(sansMotDePasse(utilisateur));
    } catch (err) {
        repondreErreur(res, err, 500, req);
    }
};
