jest.mock('../models/Affectation', () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn()
}));
jest.mock('../models/Vehicule', () => ({ findOne: jest.fn(), exists: jest.fn() }));
jest.mock('../models/User', () => ({ findOne: jest.fn(), exists: jest.fn() }));

const mongoose = require('mongoose');
const Affectation = require('../models/Affectation');
const Vehicule = require('../models/Vehicule');
const User = require('../models/User');
const { getAffectationById, getAffectations, creerAffectation, modifierAffectation } = require('../controllers/affectationController');
const { authorize } = require('../middlewares/authMiddleware');

const entrepriseId = 'entreprise-authentifiee';
const autreEntreprise = 'entreprise-du-body';
const conducteurId = 'conducteur-authentifie';

function responseMock() {
    const res = { status: jest.fn(), json: jest.fn() };
    res.status.mockReturnValue(res);
    return res;
}

function queryMock(value) {
    const query = {
        populate: jest.fn(() => query),
        sort: jest.fn(() => query),
        session: jest.fn(() => Promise.resolve(value)),
        then: (resolve, reject) => Promise.resolve(value).then(resolve, reject)
    };
    return query;
}

function rejectedSessionQuery(error) {
    return { session: jest.fn(() => Promise.reject(error)) };
}

describe('Sécurité multi-tenant et affectations', () => {
    beforeEach(() => jest.clearAllMocks());

    it('limite la lecture d’une affectation par un conducteur à ses propres missions', async () => {
        Affectation.findOne.mockReturnValue(queryMock(null));
        const req = {
            params: { id: 'affectation-1' },
            user: { _id: conducteurId, entreprise: entrepriseId, role: 'conducteur' }
        };
        const res = responseMock();

        await getAffectationById(req, res);

        expect(Affectation.findOne).toHaveBeenCalledWith({
            _id: 'affectation-1', entreprise: entrepriseId, conducteur: conducteurId
        });
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('filtre la liste des conducteurs par entreprise et par utilisateur authentifié', async () => {
        Affectation.find.mockReturnValue(queryMock([]));
        const req = { user: { _id: conducteurId, entreprise: entrepriseId, role: 'conducteur' } };

        await getAffectations(req, responseMock());

        expect(Affectation.find).toHaveBeenCalledWith({ entreprise: entrepriseId, conducteur: conducteurId });
    });

    it('ignore les champs sensibles envoyés à la modification d’une affectation', async () => {
        const modifiee = { _id: 'affectation-1' };
        Affectation.findOne.mockResolvedValue({ _id: 'affectation-1' });
        Affectation.findOneAndUpdate.mockResolvedValue(modifiee);
        const req = {
            params: { id: 'affectation-1' },
            user: { entreprise: entrepriseId, role: 'fleet_manager' },
            body: {
                observations: 'Mise à jour légitime',
                entreprise: autreEntreprise,
                statut: 'terminee',
                resoluePar: 'utilisateur-injecte'
            }
        };
        const res = responseMock();

        await modifierAffectation(req, res);

        expect(Affectation.findOne).toHaveBeenCalledWith({ _id: 'affectation-1', entreprise: entrepriseId });
        expect(Affectation.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'affectation-1', entreprise: entrepriseId },
            { observations: 'Mise à jour légitime' },
            { new: true, runValidators: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('crée l’affectation sous l’entreprise du JWT et ignore entreprise envoyée dans le body', async () => {
        const vehicule = { statut: 'disponible', save: jest.fn().mockResolvedValue(undefined) };
        const affectationCreee = { _id: 'affectation-1' };
        const session = {
            withTransaction: jest.fn(async (callback) => callback()),
            endSession: jest.fn()
        };
        jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
        Vehicule.findOne.mockReturnValue(queryMock(vehicule));
        User.findOne.mockReturnValue(queryMock({ _id: conducteurId }));
        Affectation.findOne.mockReturnValue(queryMock(null));
        Affectation.create.mockResolvedValue([affectationCreee]);
        const req = {
            user: { _id: 'manager-1', entreprise: entrepriseId, role: 'fleet_manager' },
            body: { entreprise: autreEntreprise, vehicule: 'vehicule-1', conducteur: conducteurId, kmDebut: 120 }
        };
        const res = responseMock();

        try {
            await creerAffectation(req, res);
        } finally {
            mongoose.startSession.mockRestore();
        }

        expect(Vehicule.findOne).toHaveBeenCalledWith({ _id: 'vehicule-1', entreprise: entrepriseId, actif: true });
        expect(User.findOne).toHaveBeenCalledWith({ _id: conducteurId, entreprise: entrepriseId, role: 'conducteur', actif: true });
        expect(Affectation.create).toHaveBeenCalledWith([expect.objectContaining({ entreprise: entrepriseId })], { session });
        expect(vehicule.statut).toBe('en_course');
        expect(res.status).toHaveBeenCalledWith(201);
        expect(session.endSession).toHaveBeenCalled();
    });

    it('refuse une affectation si le véhicule ne dépend pas de l’entreprise authentifiée', async () => {
        const session = {
            withTransaction: jest.fn(async (callback) => callback()),
            endSession: jest.fn()
        };
        jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
        Vehicule.findOne.mockReturnValue(queryMock(null));
        const res = responseMock();

        try {
            await creerAffectation({
                user: { _id: 'manager-1', entreprise: entrepriseId, role: 'fleet_manager' },
                body: { entreprise: autreEntreprise, vehicule: 'vehicule-etranger', conducteur: conducteurId, kmDebut: 120 }
            }, res);
        } finally {
            mongoose.startSession.mockRestore();
        }

        expect(Affectation.create).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(session.endSession).toHaveBeenCalled();
    });

    it('refuse un conducteur rattaché à une autre entreprise', async () => {
        const vehicule = { statut: 'disponible', save: jest.fn() };
        const session = {
            withTransaction: jest.fn(async (callback) => callback()),
            endSession: jest.fn()
        };
        jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
        Vehicule.findOne.mockReturnValue(queryMock(vehicule));
        User.findOne.mockReturnValue(queryMock(null));
        const res = responseMock();

        try {
            await creerAffectation({
                user: { entreprise: entrepriseId, role: 'fleet_manager' },
                body: { entreprise: autreEntreprise, vehicule: 'vehicule-1', conducteur: 'conducteur-etranger', kmDebut: 120 }
            }, res);
        } finally {
            mongoose.startSession.mockRestore();
        }

        expect(User.findOne).toHaveBeenCalledWith({ _id: 'conducteur-etranger', entreprise: entrepriseId, role: 'conducteur', actif: true });
        expect(Affectation.create).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(session.endSession).toHaveBeenCalled();
    });

    it('refuse un conducteur déjà affecté avant toute création', async () => {
        const vehicule = { statut: 'disponible', save: jest.fn() };
        const session = {
            withTransaction: jest.fn(async (callback) => callback()),
            endSession: jest.fn()
        };
        jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
        Vehicule.findOne.mockReturnValue(queryMock(vehicule));
        User.findOne.mockReturnValue(queryMock({ _id: conducteurId }));
        Affectation.findOne.mockReturnValue(queryMock({ _id: 'affectation-existante' }));
        const res = responseMock();

        try {
            await creerAffectation({
                user: { _id: 'manager-1', entreprise: entrepriseId, role: 'fleet_manager' },
                body: { vehicule: 'vehicule-1', conducteur: conducteurId, kmDebut: 120 }
            }, res);
        } finally {
            mongoose.startSession.mockRestore();
        }

        expect(Affectation.create).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(session.endSession).toHaveBeenCalled();
    });

    it('refuse de clôturer une affectation avec un kilométrage inférieur au départ', async () => {
        const session = {
            withTransaction: jest.fn(async (callback) => callback()),
            endSession: jest.fn()
        };
        jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
        Affectation.findOne.mockReturnValue(queryMock({ kmDebut: 500, statut: 'en_cours' }));
        const res = responseMock();

        try {
            await require('../controllers/affectationController').terminerAffectation({
                user: { entreprise: entrepriseId },
                params: { id: 'affectation-1' },
                body: { kmFin: 499 }
            }, res);
        } finally {
            mongoose.startSession.mockRestore();
        }

        expect(res.status).toHaveBeenCalledWith(400);
        expect(session.endSession).toHaveBeenCalled();
    });

    it('masque les erreurs MongoDB inattendues lors de la création d’une affectation en production', async () => {
        const previousEnv = process.env.NODE_ENV;
        const session = { endSession: jest.fn() };
        const error = new Error('mongodb://user:secret-password@internal/db');
        jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
        Vehicule.findOne.mockReturnValue(rejectedSessionQuery(error));
        process.env.NODE_ENV = 'production';
        const res = responseMock();

        try {
            await creerAffectation({
                user: { entreprise: entrepriseId },
                body: { vehicule: 'vehicule-1', conducteur: conducteurId, kmDebut: 120 }
            }, res);
        } finally {
            mongoose.startSession.mockRestore();
            if (previousEnv === undefined) delete process.env.NODE_ENV;
            else process.env.NODE_ENV = previousEnv;
        }

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Une erreur interne est survenue.' });
        expect(JSON.stringify(res.json.mock.calls)).not.toContain('secret-password');
        expect(session.endSession).toHaveBeenCalled();
    });

    it('applique les refus RBAC aux rôles non autorisés', () => {
        for (const role of ['admin', 'fleet_manager', 'conducteur', 'mecanicien', 'comptable']) {
            const next = jest.fn();
            const res = responseMock();
            authorize('admin', 'fleet_manager')({ user: { role } }, res, next);
            expect(next).toHaveBeenCalledTimes(['admin', 'fleet_manager'].includes(role) ? 1 : 0);
            if (!['admin', 'fleet_manager'].includes(role)) expect(res.status).toHaveBeenCalledWith(403);
        }
    });
});
