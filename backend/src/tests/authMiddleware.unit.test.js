jest.mock('../models/User', () => ({ findById: jest.fn() }));
jest.mock('../models/Entreprise', () => ({ findById: jest.fn() }));

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Entreprise = require('../models/Entreprise');
const { protect } = require('../middlewares/authMiddleware');

const secret = 'test-secret-only';

function responseMock() {
    const json = jest.fn();
    return { status: jest.fn(() => ({ json })) };
}

function token(payload, options = {}) {
    return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '1h', ...options });
}

describe('Middleware JWT et etat des comptes', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = secret;
        jest.clearAllMocks();
    });

    it('refuse un token absent', async () => {
        const res = responseMock();
        await protect({ headers: {} }, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('refuse un token signe avec un mauvais secret', async () => {
        const res = responseMock();
        const req = { headers: { authorization: `Bearer ${jwt.sign({ id: '1' }, 'wrong-secret')}` } };
        await protect(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('refuse un token expire', async () => {
        const res = responseMock();
        const req = { headers: { authorization: `Bearer ${token({ id: '1' }, { expiresIn: -1 })}` } };
        await protect(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('refuse un utilisateur desactive meme si le token est valide', async () => {
        User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ actif: false }) });
        const res = responseMock();
        const req = { headers: { authorization: `Bearer ${token({ id: '1' })}` } };
        await protect(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(401);
        expect(Entreprise.findById).not.toHaveBeenCalled();
    });

    async function verifierAccesAbonnement({ statutAbonnement, role = 'conducteur', baseUrl = '/api/vehicules', path = '/', method = 'GET' }) {
        User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: '1', role, actif: true, typeCompte: 'entreprise', entreprise: 'company-id' }) });
        Entreprise.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ actif: true, statutAbonnement }) });
        const res = responseMock();
        const next = jest.fn();
        const req = { headers: { authorization: `Bearer ${token({ id: '1' })}` }, role, baseUrl, path, method };
        await protect(req, res, next);
        return { res, next, req };
    }

    it('autorise la lecture en past_due, mais refuse les écritures hors signalement d’alerte', async () => {
        const lecture = await verifierAccesAbonnement({ statutAbonnement: 'past_due' });
        expect(lecture.next).toHaveBeenCalledTimes(1);

        const signalement = await verifierAccesAbonnement({ statutAbonnement: 'past_due', baseUrl: '/api/alertes', method: 'POST' });
        expect(signalement.next).toHaveBeenCalledTimes(1);

        const ecriture = await verifierAccesAbonnement({ statutAbonnement: 'past_due', baseUrl: '/api/vehicules', method: 'POST' });
        expect(ecriture.res.status).toHaveBeenCalledWith(403);
        expect(ecriture.next).not.toHaveBeenCalled();
    });

    it('autorise seulement l’admin à lire son profil et son entreprise en canceled', async () => {
        for (const path of ['/me', '/entreprise']) {
            const autorise = await verifierAccesAbonnement({ statutAbonnement: 'canceled', role: 'admin', baseUrl: '/api/auth', path });
            expect(autorise.next).toHaveBeenCalledTimes(1);
        }

        const autreRole = await verifierAccesAbonnement({ statutAbonnement: 'canceled', baseUrl: '/api/auth', path: '/me' });
        expect(autreRole.res.status).toHaveBeenCalledWith(403);

        const autreRoute = await verifierAccesAbonnement({ statutAbonnement: 'canceled', role: 'admin' });
        expect(autreRoute.res.status).toHaveBeenCalledWith(403);
    });

    it('refuse une entreprise desactivee meme avec un token valide', async () => {
        User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ actif: true, typeCompte: 'entreprise', entreprise: 'company-id' }) });
        Entreprise.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ actif: false, statutAbonnement: 'active' }) });
        const res = responseMock();
        const req = { headers: { authorization: `Bearer ${token({ id: '1' })}` } };

        await protect(req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it.each(['trial', 'active'])('autorise une entreprise avec abonnement %s', async (statutAbonnement) => {
        User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: '1', actif: true, typeCompte: 'entreprise', entreprise: 'company-id' }) });
        Entreprise.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ actif: true, statutAbonnement }) });
        const next = jest.fn();
        const req = { headers: { authorization: `Bearer ${token({ id: '1' })}` } };

        await protect(req, responseMock(), next);

        expect(next).toHaveBeenCalledTimes(1);
    });
});
