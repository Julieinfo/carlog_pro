jest.mock('../models/Affectation', () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn()
}));
jest.mock('../models/Vehicule', () => ({ findOne: jest.fn(), exists: jest.fn() }));
jest.mock('../models/User', () => ({ exists: jest.fn() }));
jest.mock('../models/Alerte', () => ({ find: jest.fn(), findOne: jest.fn() }));

const mongoose = require('mongoose');
const Affectation = require('../models/Affectation');
const Vehicule = require('../models/Vehicule');
const User = require('../models/User');
const Alerte = require('../models/Alerte');
const {
    modifierAffectation,
    supprimerAffectation
} = require('../controllers/affectationController');
const {
    getAlertes,
    getAlerteById,
    getAlertesByVehicule
} = require('../controllers/alerteController');

const entrepriseId = 'entreprise-test';
const conducteurId = 'conducteur-test';

function responseMock() {
    const res = { status: jest.fn(), json: jest.fn() };
    res.status.mockReturnValue(res);
    return res;
}

function queryMock(value) {
    const query = {
        populate: jest.fn(() => query),
        select: jest.fn(() => query),
        sort: jest.fn(() => query),
        session: jest.fn(() => Promise.resolve(value)),
        then: (resolve, reject) => Promise.resolve(value).then(resolve, reject)
    };
    return query;
}

function transactionSession() {
    return {
        withTransaction: jest.fn(async (callback) => callback()),
        endSession: jest.fn()
    };
}

describe('Corrections de cohérence et d’accès Phase 4', () => {
    beforeEach(() => jest.clearAllMocks());

    it('renvoie 409 si le véhicule demandé est déjà utilisé par une affectation en cours', async () => {
        const session = transactionSession();
        jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
        Affectation.findOne
            .mockReturnValueOnce(queryMock({
                _id: 'affectation-1', vehicule: 'vehicule-actuel', conducteur: conducteurId, statut: 'en_cours'
            }))
            .mockReturnValueOnce(queryMock({ _id: 'affectation-occupante' }));
        Vehicule.exists.mockReturnValue(queryMock(true));
        const res = responseMock();

        try {
            await modifierAffectation({
                params: { id: 'affectation-1' },
                user: { entreprise: entrepriseId },
                body: { vehicule: 'vehicule-occupe' }
            }, res);
        } finally {
            mongoose.startSession.mockRestore();
        }

        expect(Affectation.findOne).toHaveBeenNthCalledWith(2, {
            entreprise: entrepriseId,
            _id: { $ne: 'affectation-1' },
            statut: 'en_cours',
            $or: [{ vehicule: 'vehicule-occupe' }, { conducteur: conducteurId }]
        });
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Ce véhicule ou ce conducteur possède déjà une affectation en cours.'
        });
        expect(Vehicule.findOne).not.toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalled();
    });

    it('libère l’ancien véhicule et met le nouveau en course lors d’un changement', async () => {
        const session = transactionSession();
        const ancienVehicule = { statut: 'en_course', save: jest.fn().mockResolvedValue(undefined) };
        const nouveauVehicule = { statut: 'disponible', save: jest.fn().mockResolvedValue(undefined) };
        jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
        Affectation.findOne
            .mockReturnValueOnce(queryMock({
                _id: 'affectation-1', vehicule: 'vehicule-ancien', conducteur: conducteurId, statut: 'en_cours'
            }))
            .mockReturnValueOnce(queryMock(null));
        Vehicule.exists.mockReturnValue(queryMock(true));
        Vehicule.findOne
            .mockReturnValueOnce(queryMock(nouveauVehicule))
            .mockReturnValueOnce(queryMock(ancienVehicule));
        Affectation.findOneAndUpdate.mockResolvedValue({ _id: 'affectation-1', vehicule: 'vehicule-nouveau' });
        const res = responseMock();

        try {
            await modifierAffectation({
                params: { id: 'affectation-1' },
                user: { entreprise: entrepriseId },
                body: { vehicule: 'vehicule-nouveau' }
            }, res);
        } finally {
            mongoose.startSession.mockRestore();
        }

        expect(ancienVehicule.statut).toBe('disponible');
        expect(nouveauVehicule.statut).toBe('en_course');
        expect(ancienVehicule.save).toHaveBeenCalledWith({ session });
        expect(nouveauVehicule.save).toHaveBeenCalledWith({ session });
        expect(Affectation.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'affectation-1', entreprise: entrepriseId },
            { vehicule: 'vehicule-nouveau' },
            { new: true, runValidators: true, session }
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('libère le véhicule lorsqu’une affectation en cours est supprimée', async () => {
        const session = transactionSession();
        const vehicule = { statut: 'en_course', save: jest.fn().mockResolvedValue(undefined) };
        jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
        Affectation.findOneAndDelete.mockResolvedValue({ vehicule: 'vehicule-1', statut: 'en_cours' });
        Vehicule.findOne.mockReturnValue(queryMock(vehicule));
        const res = responseMock();

        try {
            await supprimerAffectation({
                params: { id: 'affectation-1' },
                user: { entreprise: entrepriseId }
            }, res);
        } finally {
            mongoose.startSession.mockRestore();
        }

        expect(Affectation.findOneAndDelete).toHaveBeenCalledWith(
            { _id: 'affectation-1', entreprise: entrepriseId }, { session }
        );
        expect(Vehicule.findOne).toHaveBeenCalledWith({ _id: 'vehicule-1', entreprise: entrepriseId });
        expect(vehicule.statut).toBe('disponible');
        expect(vehicule.save).toHaveBeenCalledWith({ session });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('ne touche pas au véhicule lorsqu’une affectation terminée est supprimée', async () => {
        const session = transactionSession();
        jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
        Affectation.findOneAndDelete.mockResolvedValue({ vehicule: 'vehicule-1', statut: 'terminee' });
        const res = responseMock();

        try {
            await supprimerAffectation({
                params: { id: 'affectation-1' },
                user: { entreprise: entrepriseId }
            }, res);
        } finally {
            mongoose.startSession.mockRestore();
        }

        expect(Vehicule.findOne).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('filtre la liste d’alertes d’un conducteur par ses affectations en cours', async () => {
        const alertes = [{ _id: 'alerte-1', vehicule: 'vehicule-affecte' }];
        Affectation.find.mockReturnValue(queryMock([{ vehicule: 'vehicule-affecte' }]));
        Alerte.find.mockReturnValue(queryMock(alertes));
        const res = responseMock();

        await getAlertes({
            user: { _id: conducteurId, entreprise: entrepriseId, role: 'conducteur' },
            query: {}
        }, res);

        expect(Affectation.find).toHaveBeenCalledWith({
            entreprise: entrepriseId, conducteur: conducteurId, statut: 'en_cours'
        });
        expect(Alerte.find).toHaveBeenCalledWith({
            entreprise: entrepriseId, vehicule: { $in: ['vehicule-affecte'] }
        });
        expect(res.json).toHaveBeenCalledWith(alertes);
    });

    it('ne retourne aucune alerte pour un conducteur sans véhicule affecté', async () => {
        Affectation.find.mockReturnValue(queryMock([{ vehicule: null }]));
        Alerte.find.mockReturnValue(queryMock([]));
        const res = responseMock();

        await getAlertes({
            user: { _id: conducteurId, entreprise: entrepriseId, role: 'conducteur' },
            query: {}
        }, res);

        expect(Alerte.find).toHaveBeenCalledWith({
            entreprise: entrepriseId, vehicule: { $in: [] }
        });
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it('renvoie 404 à un conducteur qui demande une alerte d’un autre véhicule', async () => {
        const alerte = { _id: 'alerte-1', entreprise: entrepriseId, vehicule: 'vehicule-autre' };
        Alerte.findOne.mockReturnValue(queryMock(alerte));
        Affectation.find.mockReturnValue(queryMock([{ vehicule: 'vehicule-affecte' }]));
        const res = responseMock();

        await getAlerteById({
            params: { id: 'alerte-1' },
            user: { _id: conducteurId, entreprise: entrepriseId, role: 'conducteur' }
        }, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Alerte introuvable ou accès non autorisé.' });
    });

    it('refuse l’historique d’un véhicule non affecté au conducteur', async () => {
        Affectation.find.mockReturnValue(queryMock([{ vehicule: 'vehicule-affecte' }]));
        const res = responseMock();

        await getAlertesByVehicule({
            params: { vehiculeId: 'vehicule-autre' },
            user: { _id: conducteurId, entreprise: entrepriseId, role: 'conducteur' }
        }, res);

        expect(Alerte.find).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
    });
});
