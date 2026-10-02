import axios from 'axios';
import { lireToken, effacerSession } from './stockageSession';

const API = axios.create({
  // En production, /api passe par le meme domaine que le frontend.
  // VITE_API_URL reste disponible si le frontend et l'API sont deployes separement.
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

const estRequeteConnexion = (error) => /\/auth\/connexion(?:[/?#]|$)/.test(error.config?.url || '');

export function messageErreurApi(error, fallback = 'Une erreur est survenue.') {
  if (!error.response) return 'Le serveur est inaccessible. Vérifiez votre connexion.';
  if (error.response.status === 401) {
    return estRequeteConnexion(error) ? fallback : 'Votre session a expiré. Veuillez vous reconnecter.';
  }
  if (error.response.status === 403) return 'Votre rôle ne permet pas cette action.';
  const erreurs = error.response.data?.erreurs;
  if (Array.isArray(erreurs) && erreurs.length) return erreurs.map((item) => item.msg).join(' ');
  return error.response.data?.message || fallback;
}

// Intercepteur pour injecter automatiquement le token JWT s'il existe dans la session
API.interceptors.request.use((config) => {
  const token = lireToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !estRequeteConnexion(error)) {
      effacerSession();
      window.dispatchEvent(new Event('auth:session-expired'));
    }
    return Promise.reject(error);
  },
);

// Export des méthodes réutilisables dans toute l'application
export const api = {
  // Authentification
  connexion: (credentials) => API.post('/auth/connexion', credentials),
  inscription: (userData) => API.post('/auth/inscription', userData),
  getProfil: () => API.get('/auth/me'),
  getEntreprise: () => API.get('/auth/entreprise'),

  // Véhicules
  getVehicules: (params = {}) => API.get('/vehicules', { params }),
  getVehicule: (id) => API.get(`/vehicules/${id}`),
  addVehicule: (data) => API.post('/vehicules', data),
  updateVehicule: (id, data) => API.put(`/vehicules/${id}`, data),
  deleteVehicule: (id) => API.delete(`/vehicules/${id}`),

  // Alertes
  getAlertes: (params = {}) => API.get('/alertes', { params }),
  getAlerte: (id) => API.get(`/alertes/${id}`),
  addAlerte: (data) => API.post('/alertes', data),
  updateAlerte: (id, data) => API.put(`/alertes/${id}`, data),
  deleteAlerte: (id) => API.delete(`/alertes/${id}`),

  // Affectations
  getAffectations: () => API.get('/affectations'),
  addAffectation: (data) => API.post('/affectations', data),
  updateAffectation: (id, data) => API.put(`/affectations/${id}`, data),
  terminerAffectation: (id, data) => API.put(`/affectations/${id}/terminer`, data),
  deleteAffectation: (id) => API.delete(`/affectations/${id}`),

  // Statistiques
  getStats: () => API.get('/stats'),

  // Entretiens
  getEntretiens: (params = {}) => API.get('/entretiens', { params }),
  getEntretien: (id) => API.get(`/entretiens/${id}`),
  addEntretien: (data) => API.post('/entretiens', data),
  updateEntretien: (id, data) => API.put(`/entretiens/${id}`, data),
  deleteEntretien: (id) => API.delete(`/entretiens/${id}`),

  // Coûts et dépenses
  getDepenses: (params = {}) => API.get('/depenses', { params }),
  getDepensesOverview: (params = {}) => API.get('/depenses/overview', { params }),
  getCarburantOverview: (params = {}) => API.get('/depenses/carburant/overview', { params }),
  addDepense: (data) => API.post('/depenses', data),
  updateDepense: (id, data) => API.put(`/depenses/${id}`, data),
  deleteDepense: (id) => API.delete(`/depenses/${id}`),

  // Utilisateurs de l'entreprise (administrateur uniquement)
  getUtilisateurs: () => API.get('/auth/utilisateurs'),
  addUtilisateur: (data) => API.post('/auth/utilisateurs', data),
  updateUtilisateur: (id, data) => API.patch(`/auth/utilisateurs/${id}`, data),
  disableUtilisateur: (id) => API.patch(`/auth/utilisateurs/${id}/desactiver`),
  reactivateUtilisateur: (id) => API.patch(`/auth/utilisateurs/${id}/reactiver`),
};

export default API;
