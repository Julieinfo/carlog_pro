jest.mock('../models/User', () => ({
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn()
}));

const User = require('../models/User');
const {
    modifierUtilisateur,
    reactiverUtilisateur,
    desactiverUtilisateur
} = require('../controllers/userController');

const entrepriseId = '507f1f77bcf86cd799439011';
const adminId = '507f1f77bcf86cd799439012';

function responseMock() {
    const res = { status: jest.fn(), json: jest.fn() };
    res.status.mockReturnValue(res);
    return res;
}

function query(value) {
    return { select: jest.fn().mockResolvedValue(value) };
}

function request(id, body = {}, userId = adminId) {
    return {
        params: { id },
        body,
        user: { _id: { toString: () => userId }, entreprise: entrepriseId, role: 'admin' }
    };
}

describe('Gestion des utilisateurs par entreprise', () => {
    beforeEach(() => jest.clearAllMocks());

    it('permet à un admin de promouvoir un autre utilisateur en admin', async () => {
        User.findOne.mockReturnValue(query({ role: 'conducteur' }));
        const updated = { _id: 'user-2', role: 'admin', email: 'nouveau@example.com' };
        User.findOneAndUpdate.mockReturnValue(query(updated));
        const res = responseMock();

        await modifierUtilisateur(request('user-2', { role: 'admin' }), res);

        expect(User.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'user-2', entreprise: entrepriseId },
            { role: 'admin' },
            { new: true, runValidators: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('ignore les champs sensibles absents de la liste blanche', async () => {
        User.findOne.mockReturnValue(query({ role: 'conducteur' }));
        User.findOneAndUpdate.mockReturnValue(query({ _id: 'user-2', telephone: '0600000000' }));
        const res = responseMock();

        await modifierUtilisateur(request('user-2', {
            telephone: '0600000000',
            entreprise: 'entreprise-injectee',
            actif: false,
            motDePasse: 'mot-de-passe-injecte'
        }), res);

        expect(User.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'user-2', entreprise: entrepriseId },
            { telephone: '0600000000' },
            { new: true, runValidators: true }
        );
    });

    it('interdit strictement à un admin de soumettre une modification de son propre rôle', async () => {
        const res = responseMock();

        await modifierUtilisateur(request(adminId, { role: 'fleet_manager' }, adminId), res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(User.findOne).not.toHaveBeenCalled();
        expect(User.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('normalise et vérifie l’unicité d’un nouvel email avant modification', async () => {
        User.findOne.mockReturnValueOnce(query({ role: 'conducteur' })).mockResolvedValueOnce(null);
        const updated = { _id: 'user-2', email: 'personne@example.com' };
        User.findOneAndUpdate.mockReturnValue(query(updated));
        const res = responseMock();

        await modifierUtilisateur(request('user-2', { email: ' Personne@Example.com ' }), res);

        expect(User.findOne).toHaveBeenNthCalledWith(2, {
            email: 'personne@example.com',
            _id: { $ne: 'user-2' }
        });
        expect(User.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'user-2', entreprise: entrepriseId },
            { email: 'personne@example.com' },
            { new: true, runValidators: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('refuse un email déjà utilisé sans modifier le compte', async () => {
        User.findOne.mockReturnValueOnce(query({ role: 'conducteur' })).mockResolvedValueOnce({ _id: 'other-user' });
        const res = responseMock();

        await modifierUtilisateur(request('user-2', { email: 'pris@example.com' }), res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(User.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('n’autorise pas la désactivation ni la réactivation de son propre compte', async () => {
        const resDesactivation = responseMock();
        const resReactivation = responseMock();

        await desactiverUtilisateur(request(adminId, {}, adminId), resDesactivation);
        await reactiverUtilisateur(request(adminId, {}, adminId), resReactivation);

        expect(resDesactivation.status).toHaveBeenCalledWith(400);
        expect(resReactivation.status).toHaveBeenCalledWith(400);
        expect(User.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('réactive uniquement un utilisateur de la même entreprise et exclut le mot de passe', async () => {
        const updated = { _id: 'user-2', actif: true };
        User.findOneAndUpdate.mockReturnValue(query(updated));
        const res = responseMock();

        await reactiverUtilisateur(request('user-2'), res);

        expect(User.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'user-2', entreprise: entrepriseId },
            { actif: true },
            { new: true }
        );
        expect(User.findOneAndUpdate.mock.results[0].value.select).toHaveBeenCalledWith('-motDePasse');
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
