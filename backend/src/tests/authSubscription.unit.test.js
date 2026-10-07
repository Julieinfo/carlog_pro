jest.mock('../models/User', () => ({ findOne: jest.fn() }));
jest.mock('../models/Entreprise', () => ({ findById: jest.fn() }));

const User = require('../models/User');
const Entreprise = require('../models/Entreprise');
const { connexion, getProfil, getEntreprise } = require('../controllers/authController');

function responseMock() {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
}

describe('contrat et lecture de l’abonnement entreprise', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = 'test-secret-only';
        jest.clearAllMocks();
    });

    it('renvoie le statut d’abonnement à la connexion sans changer les autres clés user', async () => {
        const utilisateur = {
            _id: 'user-id', nom: 'Martin', prenom: 'Camille', email: 'camille@example.com',
            role: 'admin', entreprise: 'company-id', typeCompte: 'entreprise',
            verifierMotDePasse: jest.fn().mockResolvedValue(true)
        };
        User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(utilisateur) });
        Entreprise.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ statutAbonnement: 'past_due' }) });
        const res = responseMock();

        await connexion({ body: { email: utilisateur.email, motDePasse: 'secret' } }, res);

        expect(res.json.mock.calls[0][0].user).toEqual({
            id: 'user-id', nom: 'Martin', prenom: 'Camille', email: 'camille@example.com',
            telephone: '', role: 'admin', entrepriseId: 'company-id',
            notifications: {
                application: true, email: false, entretienAvenir: true, entretienRetard: true,
                documentExpiration: true, contratEcheance: true, carburantInhabituel: true,
                resumeHebdomadaire: false, resumeMensuel: false
            },
            abonnement: 'past_due'
        });
    });

    it('renvoie le même contrat user depuis /auth/me', async () => {
        const res = responseMock();
        await getProfil({
            user: { _id: 'user-id', nom: 'Martin', prenom: 'Camille', email: 'camille@example.com', role: 'admin', entreprise: 'company-id' },
            entreprise: { statutAbonnement: 'trial' }
        }, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json.mock.calls[0][0]).toEqual({
            id: 'user-id', nom: 'Martin', prenom: 'Camille', email: 'camille@example.com',
            telephone: '', role: 'admin', entrepriseId: 'company-id',
            notifications: {
                application: true, email: false, entretienAvenir: true, entretienRetard: true,
                documentExpiration: true, contratEcheance: true, carburantInhabituel: true,
                resumeHebdomadaire: false, resumeMensuel: false
            },
            abonnement: 'trial'
        });
    });

    it('expose les informations d’abonnement en lecture seule', async () => {
        const entreprise = { nom: 'Transport Martin', statutAbonnement: 'canceled', formuleAbonnement: 'starter' };
        Entreprise.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(entreprise) });
        const res = responseMock();

        await getEntreprise({ user: { entreprise: 'company-id' } }, res);

        expect(Entreprise.findById).toHaveBeenCalledWith('company-id');
        expect(Entreprise.findByIdAndUpdate).toBeUndefined();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(entreprise);
    });
});
