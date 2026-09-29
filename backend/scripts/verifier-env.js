#!/usr/bin/env node
// Vérifie la présence et la forme des variables d'environnement du backend SANS JAMAIS afficher leur valeur.
// Usage :
//   npm run check:env                      -> lit backend/.env (développement)
//   NODE_ENV=production npm run check:env  -> exige aussi FRONTEND_URL (à lancer dans le shell Render)
//   NODE_ENV=test npm run check:env        -> lit backend/.env.test et exige MONGO_URI_TEST
// Code de sortie 1 si une variable obligatoire manque ou est manifestement invalide.

const environnement = process.env.NODE_ENV || 'development';
require('dotenv').config({ path: environnement === 'test' ? '.env.test' : '.env', quiet: true });

const MOTIF_URI_MONGO = /^mongodb(\+srv)?:\/\/.+/;
const LONGUEUR_MIN_JWT = 32;

const controles = [
    {
        nom: 'MONGO_URI',
        obligatoire: environnement !== 'test',
        valider: (v) => (MOTIF_URI_MONGO.test(v) ? null : 'doit commencer par mongodb:// ou mongodb+srv://')
    },
    {
        nom: 'MONGO_URI_TEST',
        obligatoire: environnement === 'test',
        valider: (v) => {
            if (!MOTIF_URI_MONGO.test(v)) return 'doit commencer par mongodb:// ou mongodb+srv://';
            if (process.env.MONGO_URI && v === process.env.MONGO_URI) return 'identique à MONGO_URI : la base de test doit être physiquement séparée';
            return null;
        }
    },
    {
        nom: 'JWT_SECRET',
        obligatoire: true,
        valider: (v) => (v.length >= LONGUEUR_MIN_JWT ? null : `trop court (moins de ${LONGUEUR_MIN_JWT} caractères) ; générer avec openssl rand -base64 48`)
    },
    {
        nom: 'FRONTEND_URL',
        obligatoire: environnement === 'production',
        valider: (v) => {
            if (!/^https?:\/\/[^/\s]+$/.test(v)) return 'doit être une origine exacte (schéma + hôte), sans chemin ni barre oblique finale';
            if (environnement === 'production' && !v.startsWith('https://')) return 'doit être en https:// en production';
            return null;
        }
    },
    {
        nom: 'PORT',
        obligatoire: false,
        valider: (v) => (/^\d+$/.test(v) ? null : 'doit être un entier')
    }
];

let erreurs = 0;
console.log(`Vérification des variables d'environnement (NODE_ENV=${environnement}) — les valeurs ne sont jamais affichées.`);
for (const controle of controles) {
    const valeur = process.env[controle.nom];
    if (valeur === undefined || valeur === '') {
        if (controle.obligatoire) {
            erreurs += 1;
            console.log(`  MANQUANTE  ${controle.nom}`);
        } else {
            console.log(`  absente    ${controle.nom} (facultative)`);
        }
        continue;
    }
    const probleme = controle.valider(valeur);
    if (probleme) {
        erreurs += 1;
        console.log(`  INVALIDE   ${controle.nom} : ${probleme}`);
    } else {
        console.log(`  présente   ${controle.nom}`);
    }
}

if (erreurs > 0) {
    console.log(`${erreurs} problème(s) détecté(s).`);
    process.exit(1);
}
console.log('Toutes les variables attendues sont présentes.');
