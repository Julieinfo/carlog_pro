const express = require('express');
const request = require('supertest');
const { creerLimiteur } = require('../middlewares/rateLimiters');

function creerApp(limiteur, reponse = 401) {
    const app = express();
    app.post('/connexion', limiteur, (req, res) => res.status(reponse).json({ ok: reponse === 200 }));
    return app;
}

describe('creerLimiteur', () => {
    it('renvoie 429 à la requête qui dépasse le quota avec un message générique sans seuil', async () => {
        const app = creerApp(creerLimiteur({ windowMs: 60_000, max: 2, skipSuccessfulRequests: false }));

        await request(app).post('/connexion').expect(401);
        await request(app).post('/connexion').expect(401);
        const depassement = await request(app).post('/connexion').expect(429);

        expect(depassement.body).toEqual({ message: 'Connexion temporairement indisponible. Réessayez plus tard.' });
        expect(depassement.body.message).not.toMatch(/\d/);
        expect(depassement.headers).toHaveProperty('ratelimit-limit', '2');
        expect(depassement.headers).not.toHaveProperty('x-ratelimit-limit');
    });

    it('ne consomme pas le quota de connexion avec les réponses réussies', async () => {
        const limiteur = creerLimiteur({ windowMs: 60_000, max: 2, skipSuccessfulRequests: true });
        const app = creerApp(limiteur, 200);

        await request(app).post('/connexion').expect(200);
        await request(app).post('/connexion').expect(200);
        await request(app).post('/connexion').expect(200);

        // Une erreur compte ; les succès suivants sont exclus du compteur.
        const appEchec = express();
        appEchec.post('/connexion', limiteur, (req, res) => res.status(req.query.ok === '1' ? 200 : 401).end());
        await request(appEchec).post('/connexion').expect(401);
        await request(appEchec).post('/connexion').expect(401);
        await request(appEchec).post('/connexion').expect(429);
    });
});
