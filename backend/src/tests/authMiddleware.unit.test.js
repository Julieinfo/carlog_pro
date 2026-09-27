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

    it.each(['past_due', 'canceled'])('refuse une entreprise avec abonnement %s', async (statutAbonnement) => {
        User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ actif: true, typeCompte: 'entreprise', entreprise: 'company-id' }) });
        Entreprise.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ actif: true, statutAbonnement }) });
        const res = responseMock();
        const req = { headers: { authorization: `Bearer ${token({ id: '1' })}` } };
        await protect(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(403);
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
