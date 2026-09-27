jest.mock('../models/Vehicule', () => ({ find: jest.fn(), countDocuments: jest.fn(), aggregate: jest.fn(), exists: jest.fn() }));
jest.mock('../models/Alerte', () => ({ create: jest.fn(), find: jest.fn() }));
jest.mock('../models/Affectation', () => ({ countDocuments: jest.fn() }));
jest.mock('../models/User', () => ({ find: jest.fn(), exists: jest.fn() }));

const mongoose = require('mongoose');
const Vehicule = require('../models/Vehicule');
const Alerte = require('../models/Alerte');
const Affectation = require('../models/Affectation');
const User = require('../models/User');
const { getVehicules } = require('../controllers/vehiculeController');
const { creerAlerte } = require('../controllers/alerteController');
const { getDashboardStats } = require('../controllers/statsController');
const { getUtilisateurs } = require('../controllers/userController');

const entrepriseId = '507f1f77bcf86cd799439011';

function responseMock() {
    const res = { status: jest.fn(), json: jest.fn() };
    res.status.mockReturnValue(res);
    return res;
}

function listQuery(value) {
    const query = {
        populate: jest.fn(() => query),
        sort: jest.fn(() => query),
        skip: jest.fn(() => query),
        limit: jest.fn(() => query),
        select: jest.fn(() => query),
        then: (resolve, reject) => Promise.resolve(value).then(resolve, reject)
    };
    return query;
}

describe('Contrôleurs : isolation des données d’entreprise', () => {
    beforeEach(() => jest.clearAllMocks());

    it('limite les véhicules listés à l’entreprise issue de req.user', async () => {
        Vehicule.find.mockReturnValue(listQuery([]));
        Vehicule.countDocuments.mockResolvedValue(0);
        const req = { user: { entreprise: entrepriseId, role: 'admin' }, query: {}, body: { entreprise: 'entreprise-injectee' } };

        await getVehicules(req, responseMock());

        expect(Vehicule.find).toHaveBeenCalledWith({ entreprise: entrepriseId, actif: true });
        expect(Vehicule.countDocuments).toHaveBeenCalledWith({ entreprise: entrepriseId, actif: true });
    });

    it('force l’entreprise authentifiée sur une alerte et vérifie la référence véhicule', async () => {
        Vehicule.exists.mockResolvedValue(true);
        const alerteCreee = { _id: 'alerte-1' };
        Alerte.create.mockResolvedValue(alerteCreee);
        const req = {
            user: { entreprise: entrepriseId, role: 'admin' },
            body: { entreprise: 'entreprise-injectee', vehicule: 'vehicule-1', titre: 'Pneu', typeAlerte: 'maintenance' }
        };
        const res = responseMock();

        await creerAlerte(req, res);

        expect(Vehicule.exists).toHaveBeenCalledWith({ _id: 'vehicule-1', entreprise: entrepriseId, actif: true });
        expect(Alerte.create).toHaveBeenCalledWith(expect.objectContaining({ entreprise: entrepriseId }));
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('refuse une alerte qui référence un véhicule d’une autre entreprise', async () => {
        Vehicule.exists.mockResolvedValue(false);
        const res = responseMock();

        await creerAlerte({
            user: { entreprise: entrepriseId, role: 'admin' },
            body: { vehicule: 'vehicule-etranger', titre: 'Panne', typeAlerte: 'securite' }
        }, res);

        expect(Alerte.create).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('limite les statistiques aux identifiants de l’entreprise authentifiée', async () => {
        Vehicule.aggregate.mockResolvedValue([]);
        Affectation.countDocuments.mockResolvedValue(0);
        const req = { user: { entreprise: entrepriseId } };

        await getDashboardStats(req, responseMock());

        const idAttendu = new mongoose.Types.ObjectId(entrepriseId);
        expect(Vehicule.aggregate).toHaveBeenCalledWith([
            { $match: { entreprise: idAttendu, actif: true } },
            { $group: { _id: '$statut', total: { $sum: 1 } } }
        ]);
        expect(Affectation.countDocuments).toHaveBeenCalledWith({ entreprise: idAttendu, statut: 'en_cours' });
    });

    it('ne liste que les utilisateurs de l’entreprise authentifiée', async () => {
        User.find.mockReturnValue(listQuery([]));
        const req = { user: { entreprise: entrepriseId } };

        await getUtilisateurs(req, responseMock());

        expect(User.find).toHaveBeenCalledWith({ entreprise: entrepriseId });
        expect(User.find.mock.results[0].value.select).toHaveBeenCalledWith('-motDePasse');
    });
});
