const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Entreprise = require('../models/Entreprise');
// Génération du token JWT (Valable 7 jours)
const genererToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ==========================================
// POST /api/auth/inscription
// ==========================================

exports.inscription = async (req, res) => {
    try {
        // 1. Extraction de toutes les données du body (Champs Admin + Champs Entreprise)
        const { 
        nom, 
        prenom, 
        email, 
        motDePasse, 
        telephone,
        nomEntreprise, 
        siret, 
        emailProfessionnel, 
        telephoneEntreprise,
        adresse // Doit être un objet { rue, codePostal, ville, pays }
        } = req.body;
        // 2. Vérification : l'utilisateur existe-t-il déjà ?
        if (await User.findOne({ email })) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé par un utilisateur.' });
        }
        // 3. Vérification : l'entreprise existe-t-elle déjà (via son SIRET) ?
        if (await Entreprise.findOne({ siret })) {
        return res.status(400).json({ message: 'Une entreprise avec ce SIRET est déjà enregistrée.' });
        }
        // 4. Création de l'Entreprise avec TOUS ses champs obligatoires
        const entreprise = await Entreprise.create({ 
        nom: nomEntreprise,
        siret,
        emailProfessionnel,
        telephone: telephoneEntreprise, // 🔥 Mappage correct sur le champ 'telephone' du modèle
        adresse
        });
        // 5. Création de l'utilisateur Admin lié à cette entreprise
        const user = await User.create({ 
        nom, 
        prenom,
        email, 
        motDePasse, 
        telephone,
        entreprise: entreprise._id,
        role: 'admin',             // Sécurité : Forcé pour le créateur du compte SaaS
        typeCompte: 'entreprise'   // Sécurité : Forcé pour le compte principal
        });
        // 6. Envoi de la réponse avec le token et les infos de l'user
        res.status(201).json({
        token: genererToken(user._id),
        user: { 
            id: user._id, 
            nom: user.nom, 
            prenom: user.prenom,
            email: user.email, 
            role: user.role,
            entrepriseId: entreprise._id
        },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================================
// POST /api/auth/connexion
// ==========================================

exports.connexion = async (req, res) => {
    try {
        const { email, motDePasse } = req.body;
        
        // On récupère l'user ET son mot de passe (qui est masqué par défaut dans le modèle)
        const user = await User.findOne({ email }).select('+motDePasse');
        // Si l'utilisateur n'existe pas ou que le mot de passe ne correspond pas
        if (!user || !(await user.verifierMotDePasse(motDePasse))) {
        return res.status(401).json({ message: 'Identifiants invalides.' });
        }
        res.json({
        token: genererToken(user._id),
        user: { 
            id: user._id, 
            nom: user.nom, 
            prenom: user.prenom,
            email: user.email, 
            role: user.role,
            entrepriseId: user.entreprise
        },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};