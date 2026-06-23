// 1. IMPORTATION DES PACKAGES
const express = require('express'); // Le framework pour créer le serveur et gérer les routes
const cors = require('cors');       // Sécurité pour autoriser ton frontend à requêter ton backend
require('dotenv').config();         // Charge le contenu de ton fichier .env dans 'process.env'

const app = express();

// 2. LES MIDDLEWARES (Les filtres de contrôle)
app.use(cors());          // Permet au site (port 3000 ou autre) de parler à l'API (port 5000)
app.use(express.json());  // Permet à ton serveur de lire le format JSON quand on lui envoie des données (ex: un formulaire)

// 3. LES ROUTES (Les aiguillages)
// Quand quelqu'un visite l'adresse racine "http://localhost:5000/", on lui répond un message de bienvenue
app.get('/', (req, res) => {
    res.json({ message: "Bienvenue sur l'API de CarLog Pro !" });
});

// 4. DEMARRAGE DU SERVEUR
// On récupère le PORT du fichier .env (process.env.PORT). S'il n'y est pas, on prend 5000 par défaut.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});