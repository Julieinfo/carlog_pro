const request = require('supertest');

// Ces tests n'ont pas besoin de MongoDB : ils s'arrêtent avant les contrôleurs
// (parseur JSON, route inconnue, gestionnaire d'erreurs final, CORS).

function avecEnvironnement(valeurs, action) {
    const precedent = {};
    for (const [nom, valeur] of Object.entries(valeurs)) {
        precedent[nom] = process.env[nom];
        if (valeur === undefined) delete process.env[nom];
        else process.env[nom] = valeur;
    }
    const restaurer = () => {
        for (const [nom, valeur] of Object.entries(precedent)) {
            if (valeur === undefined) delete process.env[nom];
            else process.env[nom] = valeur;
        }
    };
    return Promise.resolve()
        .then(action)
        .finally(restaurer);
}

describe('Réponses d’erreur en production (sans base de données)', () => {
    const app = require('../app');
    const corpsTropGros = JSON.stringify({ email: 'x'.repeat(101 * 1024) });

    // Hors NODE_ENV=test, le gestionnaire final journalise le nom de l'erreur : on garde la sortie Jest lisible.
    let consoleErreur;
    beforeEach(() => {
        consoleErreur = jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => {
        consoleErreur.mockRestore();
    });

    it('renvoie 413 avec un message clair pour un JSON de plus de 100 kb', () => avecEnvironnement({ NODE_ENV: 'production' }, async () => {
        const res = await request(app)
            .post('/api/auth/connexion')
            .set('Content-Type', 'application/json')
            .send(corpsTropGros);

        expect(res.status).toBe(413);
        expect(res.body).toEqual({ message: 'Corps de requête trop volumineux.' });
    }));

    it('renvoie 400 avec un message clair pour un JSON malformé, sans détail du parseur', () => avecEnvironnement({ NODE_ENV: 'production' }, async () => {
        const res = await request(app)
            .post('/api/auth/connexion')
            .set('Content-Type', 'application/json')
            .send('{"email": ');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Corps de requête JSON invalide.' });
        expect(JSON.stringify(res.body)).not.toMatch(/Unexpected|token|position|JSON\.parse/i);
    }));

    it('conserve le message détaillé hors production pour faciliter le débogage', async () => {
        const res = await request(app)
            .post('/api/auth/connexion')
            .set('Content-Type', 'application/json')
            .send(corpsTropGros);

        expect(res.status).toBe(413);
        expect(res.body.message).not.toBe('Corps de requête trop volumineux.');
        expect(res.body.message).toEqual(expect.any(String));
    });

    it('renvoie une 404 JSON générique pour une route /api inconnue', async () => {
        const res = await request(app).get('/api/route-inexistante');

        expect(res.status).toBe(404);
        expect(res.headers['content-type']).toMatch(/application\/json/);
        expect(res.body).toEqual({ message: 'Ressource introuvable.' });
    });

    it('ne masque pas la documentation Swagger avec la 404 JSON', async () => {
        const res = await request(app).get('/api-docs/');

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/text\/html/);
    });

    it('masque le détail d’une erreur interne inattendue en production', () => avecEnvironnement({ NODE_ENV: 'production' }, async () => {
        const couches = (app.router || app._router).stack;
        const gestionnaireFinal = [...couches].reverse().find((couche) => couche.handle.length === 4).handle;
        const json = jest.fn();
        const res = { status: jest.fn(() => ({ json })) };

        gestionnaireFinal(new Error('détail MongoDB confidentiel'), {}, res, () => {});

        expect(res.status).toHaveBeenCalledWith(500);
        expect(json).toHaveBeenCalledWith({ message: 'Une erreur interne est survenue.' });
        expect(consoleErreur.mock.calls.flat().join(' ')).not.toContain('confidentiel');
    }));
});

describe('CORS en production', () => {
    function chargerAppProduction() {
        let appProduction;
        jest.isolateModules(() => {
            appProduction = require('../app');
        });
        return appProduction;
    }

    it('accepte FRONTEND_URL même saisie avec une barre oblique finale', () => avecEnvironnement(
        { NODE_ENV: 'production', FRONTEND_URL: 'https://exemple-frontend.vercel.app/' },
        async () => {
            const appProduction = chargerAppProduction();
            const res = await request(appProduction)
                .options('/api/auth/connexion')
                .set('Origin', 'https://exemple-frontend.vercel.app')
                .set('Access-Control-Request-Method', 'POST');

            expect(res.headers['access-control-allow-origin']).toBe('https://exemple-frontend.vercel.app');
        }
    ));

    it('refuse les origines locales et inconnues en production', () => avecEnvironnement(
        { NODE_ENV: 'production', FRONTEND_URL: 'https://exemple-frontend.vercel.app' },
        async () => {
            const appProduction = chargerAppProduction();
            for (const origine of ['http://localhost:5173', 'https://attaquant.example']) {
                const res = await request(appProduction)
                    .options('/api/auth/connexion')
                    .set('Origin', origine)
                    .set('Access-Control-Request-Method', 'POST');

                expect(res.headers['access-control-allow-origin']).toBeUndefined();
            }
        }
    ));
});
