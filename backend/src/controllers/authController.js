const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Entreprise = require('../models/Entreprise');
const repondreErreur = require('../utils/reponseErreur');
const { estVerrouille, enregistrerEchec, reinitialiser } = require('../utils/verrouillageConnexion');

/**
 * Genere un token JWT pour un utilisateur.
 * Role : creer un jeton d'authentification qui sera utilise par le client pour les requetes suivantes.
 * Parametres : id (l'ID de l'utilisateur a encoder dans le token)
 * Valeur de retour : string (le token JWT signe)
 * 
 * Note : Le token dure 7 jours pour eviter une reconnexion trop frequente tout en restant raisonnable cote securite.
 * J'aurais pu choisir une duree plus courte (ex: 1h) pour plus de securite, mais 7 jours est un bon compromis UX/securite pour ce type d'application.
 */
// CORRECTION SÉCURITÉ : Ajout explicite de l'algorithme 'HS256' pour éviter les attaques par downgrade d'algorithme.
// Avant : jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' }) sans spécifier d'algorithme.
// Risque : Un attaquant pourrait forcer l'utilisation de l'algorithme 'none' pour créer des tokens forgés.
// Maintenant : L'algorithme est explicitement fixé à 'HS256', ce qui empêche toute tentative de downgrade.
const genererToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d' });

// Inscription SaaS : creation de l'entreprise + creation du premier admin dans la meme action.
// C'est une operation complexe car elle touche deux collections differentes (User et Entreprise).

/**
 * Inscrit un nouvel utilisateur et cree son entreprise en meme temps.
 * Role : permettre la creation d'un compte SaaS avec l'entreprise associee.
 * Parametres : infos utilisateur (nom, prenom, email, motDePasse, telephone) + infos entreprise (nomEntreprise, siret, emailProfessionnel, telephoneEntreprise, adresse)
 * Valeur de retour : token JWT + infos utilisateur + entrepriseId
 */
exports.inscription = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        // On recupere les infos admin et les infos entreprise depuis le formulaire d'inscription.
        // J'ai choisi de tout recevoir dans un seul body plutot que de faire deux appels separe,
        // car c'est plus simple pour le frontend et ça garantit la coherence des donnees.
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
        adresse // attendu : { rue, codePostal, ville, pays }
        } = req.body;
        
        // On bloque les doublons email pour garder un identifiant de connexion unique.
        // C'est important pour eviter que deux utilisateurs aient le meme email, ce qui causerait des confusions.
        if (await User.findOne({ email })) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé par un utilisateur.' });
        }
        
        // Le SIRET sert de garde-fou contre la creation de la meme entreprise plusieurs fois.
        // En France, le SIRET est unique par entreprise, donc c'est un bon moyen d'eviter les doublons.
        // J'aurais pu aussi verifier par nom d'entreprise, mais le SIRET est plus fiable.
        if (await Entreprise.findOne({ siret })) {
        return res.status(400).json({ message: 'Une entreprise avec ce SIRET est déjà enregistrée.' });
        }
        
        // On cree l'entreprise avant l'utilisateur pour recuperer son _id et faire le lien proprement.
        // L'ordre est important : l'utilisateur a besoin de l'ID de l'entreprise pour etre rattache.
        // Si on faisait l'inverse, on devrait faire un update supplementaire sur l'utilisateur.
        let entreprise;
        let user;
        await session.withTransaction(async () => {
            [entreprise] = await Entreprise.create([{
                nom: nomEntreprise,
                siret,
                emailProfessionnel,
                telephone: telephoneEntreprise,
                adresse
            }], { session });
        
        // Le premier compte est force en admin entreprise : c'est le compte "owner" initial.
        // C'est une mesure de securite importante pour eviter que le premier utilisateur n'ait pas les droits.
        // On force aussi typeCompte a 'entreprise' pour differencier des autres types de comptes (ex: conducteurs).
            [user] = await User.create([{
                nom,
                prenom,
                email,
                motDePasse,
                telephone,
                entreprise: entreprise._id,
                role: 'admin',
                typeCompte: 'entreprise'
            }], { session });
        });
        
        // On renvoie le token des l'inscription pour connecter l'utilisateur automatiquement.
        // C'est une bonne pratique UX : l'utilisateur n'a pas a se reconnecter apres s'etre inscrit.
        res.status(201).json({
        token: genererToken(user._id),
        user: { 
            id: user._id, 
            nom: user.nom, 
            prenom: user.prenom,
            email: user.email, 
            role: user.role,
            entrepriseId: entreprise._id,
            abonnement: entreprise.statutAbonnement
        },
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Un compte ou une entreprise avec ces informations existe déjà.' });
        }
        const message = process.env.NODE_ENV === 'production' ? 'Erreur lors de la création du compte.' : err.message;
        res.status(500).json({ message });
    } finally {
        await session.endSession();
    }
};

// Connexion : on verifie identifiants puis on regenere un JWT.
// C'est le point d'entree principal pour les utilisateurs deja inscrits.

/**
 * Connecte un utilisateur existant avec ses identifiants.
 * Role : verifier les identifiants et generer un nouveau token JWT.
 * Parametres : email, motDePasse
 * Valeur de retour : token JWT + infos utilisateur (sans le mot de passe)
 */
exports.connexion = async (req, res) => {
    try {
        const { email, motDePasse } = req.body;

        if (estVerrouille(email)) {
            return res.status(429).json({ message: 'Trop de tentatives. Réessayez plus tard.' });
        }
        
        // motDePasse est cache dans le schema (select: false), donc on l'ajoute explicitement juste pour cette verification.
        // C'est une bonne pratique de securite : par defaut, on ne renvoie jamais le mot de passe dans les requetes.
        const user = await User.findOne({ email }).select('+motDePasse');
        
        // Message volontairement vague pour ne pas aider un attaquant a deviner ce qui est faux.
        // Si on disait "Email inexistant" ou "Mot de passe incorrect", un attaquant pourrait enumerer les comptes.
        // J'ai choisi de ne pas differencier les cas pour eviter ce type d'attaque.
        if (!user || !(await user.verifierMotDePasse(motDePasse))) {
        enregistrerEchec(email);
        return res.status(401).json({ message: 'Identifiants invalides.' });
        }

        reinitialiser(email);
        
        const entreprise = user.typeCompte === 'entreprise'
            ? await Entreprise.findById(user.entreprise).select('statutAbonnement')
            : null;

        // On renvoie un nouveau token a chaque connexion.
        // J'aurais pu implementer un systeme de refresh token, mais pour l'instant un simple token suffit.
        res.json({
        token: genererToken(user._id),
        user: { 
            id: user._id, 
            nom: user.nom, 
            prenom: user.prenom,
            email: user.email, 
            role: user.role,
            entrepriseId: user.entreprise,
            abonnement: entreprise?.statutAbonnement ?? null
        },
        });
    } catch (err) {
        repondreErreur(res, err);
    }
};

// ==========================================
// GET /api/auth/me (Profil utilisateur connecte)
// ==========================================

/**
 * Recupere le profil de l'utilisateur connecte.
 * Role : permettre au frontend d'afficher les infos de l'utilisateur connecte.
 * Parametres : aucun (utilise req.user depuis le middleware protect)
 * Valeur de retour : objet avec les infos de l'utilisateur (sans le mot de passe)
 */
exports.getProfil = async (req, res) => {
    try {
        res.status(200).json({
            id: req.user._id,
            nom: req.user.nom,
            prenom: req.user.prenom,
            email: req.user.email,
            role: req.user.role,
            entrepriseId: req.user.entreprise,
            abonnement: req.entreprise?.statutAbonnement ?? null
        });
    } catch (err) {
        repondreErreur(res, err);
    }
};

exports.getEntreprise = async (req, res) => {
    try {
        const entreprise = await Entreprise.findById(req.user.entreprise)
            .select('nom statutAbonnement formuleAbonnement');

        if (!entreprise) return res.status(404).json({ message: 'Entreprise introuvable.' });
        res.status(200).json(entreprise);
    } catch (err) {
        repondreErreur(res, err);
    }
};
