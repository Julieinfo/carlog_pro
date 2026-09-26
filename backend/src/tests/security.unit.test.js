const request = require('supertest');
const app = require('../app');
const validateObjectId = require('../middlewares/validateObjectId');
const repondreErreur = require('../utils/reponseErreur');
const { authorize } = require('../middlewares/authMiddleware');

describe('Protections API sans base de donnees', () => {
    it('rejette un identifiant MongoDB mal forme en 400', () => {
        const req = { params: { id: 'pas-un-objectid' } };
        const json = jest.fn();
        const res = { status: jest.fn(() => ({ json })) };
        const next = jest.fn();

        validateObjectId('id')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith({ message: 'Identifiant id invalide.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('laisse passer un identifiant MongoDB valide', () => {
        const req = { params: { id: '507f1f77bcf86cd799439011' } };
        const next = jest.fn();

        validateObjectId('id')(req, {}, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    it('refuse un role qui ne figure pas dans la permission', () => {
        const req = { user: { role: 'conducteur' } };
        const json = jest.fn();
        const res = { status: jest.fn(() => ({ json })) };
        const next = jest.fn();

        authorize('admin')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('ne renvoie pas le detail interne en production', () => {
        const environnement = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        const json = jest.fn();
        const res = { status: jest.fn(() => ({ json })) };

        repondreErreur(res, new Error('detail MongoDB confidentiel'));

        expect(json).toHaveBeenCalledWith({ message: 'Une erreur interne est survenue.' });
        process.env.NODE_ENV = environnement;
    });

    it('active les en-tetes de securite Express', async () => {
        const response = await request(app).get('/');
        expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
});
