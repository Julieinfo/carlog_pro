jest.mock('../models/User', () => ({ findOne: jest.fn() }));

const User = require('../models/User');
const { connexion } = require('../controllers/authController');
const { enregistrerEchec, reinitialiser } = require('../utils/verrouillageConnexion');

describe('authController.connexion avec email verrouillé', () => {
    beforeEach(() => {
        reinitialiser('verrouille@example.com');
        for (let i = 0; i < 5; i += 1) enregistrerEchec('verrouille@example.com');
        User.findOne.mockReset();
    });

    afterEach(() => reinitialiser('verrouille@example.com'));

    it('renvoie 429 sans rechercher le mot de passe', async () => {
        const req = { body: { email: 'verrouille@example.com', motDePasse: 'secret' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        await connexion(req, res);

        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith({ message: 'Connexion temporairement indisponible. Réessayez plus tard.' });
        expect(User.findOne).not.toHaveBeenCalled();
    });
});
