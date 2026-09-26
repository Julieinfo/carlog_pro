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
        repondreErreur(res, err);
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
        repondreErreur(res, err);
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
        repondreErreur(res, err);
    }
};
