import { useEffect, useState } from 'react';
import { api, messageErreurApi } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import PiedDePageLegal from '../components/PiedDePageLegal';

const typesVehicule = ['porteur', 'tracteur', 'remorque', 'utilitaire', 'voiture'];
const carburants = ['diesel', 'gnv', 'electrique', 'hydrogene', 'essence', 'hybride'];
const statutsVehicule = ['disponible', 'en_course', 'en_maintenance', 'en_panne'];
const typesAlerte = ['maintenance', 'carburant', 'securite', 'geo-fencing', 'administratif'];
const urgences = ['information', 'low', 'medium', 'high', 'critical'];
const statutsAlerte = ['active', 'en_cours', 'resolue', 'acquittee'];
const libellesUrgence = { information: 'Information', low: 'Faible', medium: 'Moyen', high: 'Élevé', critical: 'Critique' };
const libellesStatutAlerte = { active: 'Active', en_cours: 'En cours', resolue: 'Traitée', acquittee: 'Ignorée' };
const typesEntretien = ['vidange', 'controle_technique', 'pneumatiques', 'reparation', 'revision', 'autre'];
const statutsEntretien = ['planifie', 'en_cours', 'realise'];
const categoriesDepense = ['carburant', 'peages', 'assurances', 'leasing', 'entretien', 'reparation', 'autres'];
const typesDocument = ['assurance', 'carte_grise', 'controle_technique', 'leasing', 'location', 'facture', 'autre'];
const statutsDocument = ['actif', 'a_renouveler', 'urgent', 'expire', 'archive'];
const roles = ['admin', 'fleet_manager', 'conducteur', 'mecanicien', 'comptable'];
const libellesRoles = { admin: 'Administrateur', fleet_manager: 'Gestionnaire de flotte', conducteur: 'Conducteur', mecanicien: 'Mécanicien', comptable: 'Comptable' };

const vehicleInitial = { immatriculation: '', marque: '', modele: '', photoUrl: '', typeVehicule: 'utilitaire', annee: '', dateMiseEnService: '', ptac: '', carburant: 'diesel', kilometrage: 0, statut: 'disponible' };
const alertInitial = { titre: '', description: '', typeAlerte: 'maintenance', niveauUrgence: 'medium', vehicule: '', conducteur: '' };
const assignmentInitial = { vehicule: '', conducteur: '', dateDebut: '', kmDebut: 0, observations: '' };
const userInitial = { nom: '', prenom: '', email: '', telephone: '', motDePasse: '', role: 'conducteur' };
const entretienInitial = { vehicule: '', typeEntretien: 'revision', statut: 'planifie', dateEntretien: '', kilometragePrevisionnel: '', kilometrageReel: '', cout: 0, description: '' };
const depenseInitial = { vehicule: '', categorie: 'carburant', dateDepense: '', montant: '', kilometrage: '', litres: '', prixAuLitre: '', description: '' };
const documentInitial = { vehicule: '', typeDocument: 'assurance', reference: '', prestataire: '', dateDebut: '', dateEcheance: '', cout: '' };
const profileInitial = { nom: '', prenom: '', email: '', telephone: '', motDePasseActuel: '', nouveauMotDePasse: '', confirmationMotDePasse: '' };
const notificationsInitial = { application: true, email: false, entretienAvenir: true, entretienRetard: true, documentExpiration: true, contratEcheance: true, carburantInhabituel: true, resumeHebdomadaire: false, resumeMensuel: false };
const entrepriseInitial = { nom: '', logoUrl: '', secteurActivite: '', telephone: '', emailProfessionnel: '', adresse: { rue: '', codePostal: '', ville: '', pays: 'France' }, tailleFlotte: 0, siret: '', devise: 'EUR', fuseauHoraire: 'Europe/Paris', formatDate: 'DD/MM/YYYY', uniteDistance: 'kilometres', uniteCarburant: 'litres', seuilConsommationInhabituelle: 12, delaiAlerteDocument: 30, delaiAlerteContrat: 30 };
const typesRapport = ['activite', 'couts', 'carburant', 'entretiens', 'alertes', 'affectations'];
const libellesRapport = { activite: 'Activité', couts: 'Coûts', carburant: 'Carburant', entretiens: 'Entretiens', alertes: 'Alertes', affectations: 'Affectations' };

function asList(response) {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  return data?.data || data?.alertes || data?.affectations || [];
}
function label(value) { return String(value || '').replaceAll('_', ' '); }

function TopBar({ user, themeToggle, notificationCount, onHome, onNotifications, onMenuAction, onLogout }) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="navbar">
      <button className="logo logo-button" type="button" onClick={onHome} aria-label="Retourner au tableau de bord">
        CarLog <span>Pro</span>
      </button>
      <div className="user-menu">
        <button className="notification-button" type="button" onClick={onNotifications} aria-label={`Voir les alertes (${notificationCount} non lues)`}>
          <span aria-hidden="true">🔔</span>
          {notificationCount > 0 && <b className="notification-badge">{notificationCount > 99 ? '99+' : notificationCount}</b>}
        </button>
        <div className="profile-menu">
          <button className="profile-button" type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-haspopup="menu">
            <span className="profile-name">{user?.prenom || 'Utilisateur'}</span>
            <span aria-hidden="true">⌄</span>
          </button>
          {profileOpen && (
            <div className="profile-dropdown" role="menu">
              <strong>{[user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Utilisateur'}</strong>
              {user?.email && <small>{user.email}</small>}
              {user?.role && <small>{libellesRoles[user.role] || user.role}</small>}
              <div className="profile-links">
                <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); onMenuAction('profil'); }}>Mon profil</button>
                <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); onMenuAction('entreprise'); }}>Paramètres de l’entreprise</button>
                <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); onMenuAction('documents'); }}>Documents & contrats</button>
                <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); onMenuAction('notifications'); }}>Préférences de notification</button>
                <a href="mailto:juliedecastro2003@gmail.com" role="menuitem" onClick={() => setProfileOpen(false)}>Centre d’aide</a>
                <a href="#/mentions-legales" role="menuitem" onClick={() => setProfileOpen(false)}>Mentions légales</a>
                <a href="#/cgu" role="menuitem" onClick={() => setProfileOpen(false)}>Conditions d’utilisation</a>
                <a href="#/politique-confidentialite" role="menuitem" onClick={() => setProfileOpen(false)}>Politique de confidentialité</a>
              </div>
              <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); onLogout(); }}>Déconnexion</button>
            </div>
          )}
        </div>
        {themeToggle}
      </div>
    </header>
  );
}

export default function Dashboard({ themeToggle }) {
  const { token, logout, user, login } = useAuth();
  const [tab, setTab] = useState('accueil');
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [entretiens, setEntretiens] = useState([]);
  const [depenses, setDepenses] = useState([]);
  const [coutsOverview, setCoutsOverview] = useState(null);
  const [carburantOverview, setCarburantOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [entrepriseInfo, setEntrepriseInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [vehicleFilters, setVehicleFilters] = useState({ search: '', typeVehicule: '', statut: '', page: 1 });
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1, totalItems: 0 });
  const [vehicleForm, setVehicleForm] = useState(vehicleInitial);
  const [alertForm, setAlertForm] = useState(alertInitial);
  const [assignmentForm, setAssignmentForm] = useState(assignmentInitial);
  const [userForm, setUserForm] = useState(userInitial);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [alertFilters, setAlertFilters] = useState({ statut: '', niveauUrgence: '', vehicule: '' });
  const [entretienFilters, setEntretienFilters] = useState({ statut: '', typeEntretien: '' });
  const [entretienForm, setEntretienForm] = useState(entretienInitial);
  const [selectedVehicleHistory, setSelectedVehicleHistory] = useState(null);
  const [coutsFilters, setCoutsFilters] = useState({ debut: '', fin: '', vehicule: '', categorie: '' });
  const [depenseForm, setDepenseForm] = useState(depenseInitial);
  const [editingDepense, setEditingDepense] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentFilters, setDocumentFilters] = useState({ vehicule: '', typeDocument: '', statut: '' });
  const [documentForm, setDocumentForm] = useState(documentInitial);
  const [documentFile, setDocumentFile] = useState(null);
  const [reportFilters, setReportFilters] = useState({ type: 'activite', debut: '', fin: '', vehicule: '' });
  const [generatedReport, setGeneratedReport] = useState(null);
  const [profileForm, setProfileForm] = useState(profileInitial);
  const [notificationsForm, setNotificationsForm] = useState(notificationsInitial);
  const [entrepriseForm, setEntrepriseForm] = useState(entrepriseInitial);

  const isAdmin = user?.role === 'admin';
  const readOnly = user?.abonnement === 'past_due';
  const canceled = user?.abonnement === 'canceled';
  const canManageFleet = !readOnly && ['admin', 'fleet_manager'].includes(user?.role);
  const canViewUsers = ['admin', 'fleet_manager'].includes(user?.role);
  const canModifyAlerts = !readOnly && ['admin', 'fleet_manager', 'mecanicien'].includes(user?.role);

  useEffect(() => {
    if (user) setProfileForm({ ...profileInitial, nom: user.nom || '', prenom: user.prenom || '', email: user.email || '', telephone: user.telephone || '' });
  }, [user]);
  useEffect(() => {
    if (user) setNotificationsForm({ ...notificationsInitial, ...(user.notifications || {}) });
  }, [user]);

  async function loadData(params = {}) {
    setLoading(true);
    setError('');
    const results = await Promise.allSettled([
      api.getVehicules({ page: 1, limit: 10, ...vehicleFilters, ...params }),
      api.getAlertes(),
      api.getAffectations(),
      api.getEntretiens(),
      api.getDepenses(coutsFilters),
      api.getDepensesOverview(coutsFilters),
      api.getCarburantOverview(coutsFilters),
      api.getDocuments(documentFilters),
      api.getStats(),
      canViewUsers ? api.getUtilisateurs() : Promise.resolve(null),
    ]);
    if (results.some((item) => item.status === 'rejected' && item.reason?.response?.status === 401)) {
      logout();
      setError('Votre session a expiré. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }
    const [vehicleResult, alertResult, assignmentResult, entretienResult, depenseResult, coutsResult, carburantResult, documentResult, statsResult, userResult] = results;
    if (vehicleResult.status === 'fulfilled') {
      setVehicles(vehicleResult.value.data?.data || []);
      setPagination(vehicleResult.value.data?.pagination || pagination);
    }
    if (alertResult.status === 'fulfilled') setAlerts(asList(alertResult.value));
    if (assignmentResult.status === 'fulfilled') setAssignments(asList(assignmentResult.value));
    if (entretienResult.status === 'fulfilled') setEntretiens(asList(entretienResult.value));
    if (depenseResult.status === 'fulfilled') setDepenses(asList(depenseResult.value));
    if (coutsResult.status === 'fulfilled') setCoutsOverview(coutsResult.value.data?.data || null);
    if (carburantResult.status === 'fulfilled') setCarburantOverview(carburantResult.value.data?.data || null);
    if (documentResult.status === 'fulfilled') setDocuments(asList(documentResult.value));
    if (statsResult.status === 'fulfilled') setStats(statsResult.value.data);
    if (userResult?.status === 'fulfilled') setUsers(asList(userResult.value));
    const blockingError = [vehicleResult, alertResult, assignmentResult, entretienResult].find((item) => item.status === 'rejected');
    if (blockingError) setError(messageErreurApi(blockingError.reason));
    setLoading(false);
  }

  useEffect(() => { if (!canceled) loadData(); }, [token, canManageFleet, canceled]);
  useEffect(() => {
    if (isAdmin) api.getEntreprise().then((response) => { setEntrepriseInfo(response.data); setEntrepriseForm({ ...entrepriseInitial, ...response.data, adresse: { ...entrepriseInitial.adresse, ...(response.data.adresse || {}) } }); }).catch((exception) => { if (canceled) setError(messageErreurApi(exception)); });
  }, [isAdmin, canceled]);

  async function refreshSubscription() {
    try {
      const response = await api.getProfil();
      login(response.data, token);
    } catch (exception) { handleError(exception); }
  }

  async function saveProfile(event) {
    event.preventDefault();
    try {
      const donnees = { nom: profileForm.nom, prenom: profileForm.prenom, email: profileForm.email, telephone: profileForm.telephone };
      if (profileForm.motDePasseActuel || profileForm.nouveauMotDePasse || profileForm.confirmationMotDePasse) {
        Object.assign(donnees, {
          motDePasseActuel: profileForm.motDePasseActuel,
          nouveauMotDePasse: profileForm.nouveauMotDePasse,
          confirmationMotDePasse: profileForm.confirmationMotDePasse,
        });
      }

      const response = await api.updateProfil(donnees);
      login(response.data, token);
      setProfileForm({ ...profileInitial, nom: response.data.nom, prenom: response.data.prenom, email: response.data.email, telephone: response.data.telephone || '' });
      setNotice('Profil enregistré.');
    } catch (exception) { handleError(exception); }
  }

  async function saveNotifications(event) {
    event.preventDefault();
    try {
      const response = await api.updateProfil({ notifications: notificationsForm });
      login(response.data, token);
      setNotificationsForm({ ...notificationsInitial, ...(response.data.notifications || {}) });
      setNotice('Préférences de notification enregistrées.');
    } catch (exception) { handleError(exception); }
  }

  async function saveEntreprise(event) {
    event.preventDefault();
    try {
      const response = await api.updateEntreprise({
        ...entrepriseForm,
        tailleFlotte: Number(entrepriseForm.tailleFlotte),
        seuilConsommationInhabituelle: Number(entrepriseForm.seuilConsommationInhabituelle),
        delaiAlerteDocument: Number(entrepriseForm.delaiAlerteDocument),
        delaiAlerteContrat: Number(entrepriseForm.delaiAlerteContrat),
      });
      setEntrepriseInfo(response.data);
      setEntrepriseForm({
        ...entrepriseInitial,
        ...response.data,
        adresse: { ...entrepriseInitial.adresse, ...(response.data.adresse || {}) },
      });
      setNotice('Paramètres de l’entreprise enregistrés.');
    } catch (exception) {
      handleError(exception);
    }
  }

  function handleError(exception) {
    if (exception.response?.status === 401) {
      logout();
      setError('Votre session a expiré. Veuillez vous reconnecter.');
    } else setError(messageErreurApi(exception));
  }
  async function saveVehicle(event) {
    event.preventDefault();
    try {
      const data = { ...vehicleForm, annee: vehicleForm.annee ? Number(vehicleForm.annee) : undefined, dateMiseEnService: vehicleForm.dateMiseEnService || undefined, ptac: vehicleForm.ptac === '' ? '' : Number(vehicleForm.ptac), kilometrage: Number(vehicleForm.kilometrage) };
      if (editingVehicle) await api.updateVehicule(editingVehicle._id, data); else await api.addVehicule(data);
      setVehicleForm(vehicleInitial); setEditingVehicle(null); setNotice('Véhicule enregistré.'); await loadData();
    } catch (exception) { handleError(exception); }
  }
  async function archiveVehicle(id) {
    if (!window.confirm('Archiver ce véhicule ?')) return;
    try { await api.deleteVehicule(id); setNotice('Véhicule archivé.'); await loadData(); } catch (exception) { handleError(exception); }
  }
  async function saveAlert(event) {
    event.preventDefault();
    try {
      const data = { ...alertForm };
      if (!data.vehicule) delete data.vehicule;
      if (!data.conducteur) delete data.conducteur;
      await api.addAlerte(data); setAlertForm(alertInitial); setNotice('Alerte créée.'); await loadData();
    } catch (exception) { handleError(exception); }
  }
  async function changeAlert(id, statut) { try { await api.updateAlerte(id, { statut }); setNotice('Alerte mise à jour.'); await loadData(); } catch (exception) { handleError(exception); } }
  async function deleteAlert(id) { if (!window.confirm('Supprimer cette alerte ?')) return; try { await api.deleteAlerte(id); setNotice('Alerte supprimée.'); await loadData(); } catch (exception) { handleError(exception); } }
  async function saveAssignment(event) {
    event.preventDefault();
    try {
      const data = { ...assignmentForm, kmDebut: Number(assignmentForm.kmDebut) };
      if (editingAssignment) await api.updateAffectation(editingAssignment._id, data); else await api.addAffectation(data);
      setAssignmentForm(assignmentInitial); setEditingAssignment(null); setNotice('Affectation enregistrée.'); await loadData();
    } catch (exception) { handleError(exception); }
  }
  async function saveEntretien(event) {
    event.preventDefault();
    try {
      const data = {
        ...entretienForm,
        typeEntretien: entretienForm.typeEntretien.replaceAll(' ', '_'),
        statut: entretienForm.statut.replaceAll(' ', '_'),
        cout: Number(entretienForm.cout),
      };
      ['kilometragePrevisionnel', 'kilometrageReel'].forEach((champ) => {
        if (data[champ] === '') delete data[champ]; else if (data[champ] !== undefined) data[champ] = Number(data[champ]);
      });
      await api.addEntretien(data);
      setEntretienForm(entretienInitial);
      setNotice('Entretien enregistré.');
      await loadData();
    } catch (exception) { handleError(exception); }
  }
  async function saveDepense(event) {
    event.preventDefault();
    try {
      const data = { ...depenseForm, montant: Number(depenseForm.montant) };
      ['kilometrage', 'litres', 'prixAuLitre'].forEach((champ) => {
        if (data[champ] === '') delete data[champ]; else data[champ] = Number(data[champ]);
      });
      if (editingDepense) await api.updateDepense(editingDepense._id, data); else await api.addDepense(data);
      setDepenseForm(depenseInitial);
      setEditingDepense(null);
      setNotice('Dépense enregistrée.');
      await loadData();
    } catch (exception) { handleError(exception); }
  }
  async function saveDocument(event) {
    event.preventDefault();
    try {
      if (!documentFile) throw new Error('Sélectionnez un fichier.');
      const data = new FormData();
      Object.entries(documentForm).forEach(([key, value]) => { if (value !== '') data.append(key, value); });
      data.append('fichier', documentFile);
      await api.addDocument(data);
      setDocumentForm(documentInitial); setDocumentFile(null); event.target.reset(); setNotice('Document ajouté.'); await loadData();
    } catch (exception) { handleError(exception); }
  }
  async function downloadDocument(item) {
    try {
      const response = await api.downloadDocument(item._id);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a'); link.href = url; link.download = item.nomOriginal; link.click(); URL.revokeObjectURL(url);
    } catch (exception) { handleError(exception); }
  }
  async function previewDocument(item) {
    try {
      const response = await api.previewDocument(item._id);
      const url = URL.createObjectURL(response.data);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (exception) { handleError(exception); }
  }
  async function archiveDocument(item) {
    try { await api.updateDocument(item._id, { statut: 'archive' }); setNotice('Document archivé.'); await loadData(); } catch (exception) { handleError(exception); }
  }
  async function deleteDocument(id) {
    if (!window.confirm('Supprimer définitivement ce document ?')) return;
    try { await api.deleteDocument(id); setNotice('Document supprimé.'); await loadData(); } catch (exception) { handleError(exception); }
  }
  function editDepense(item) {
    setEditingDepense(item);
    setDepenseForm({
      ...depenseInitial,
      ...item,
      vehicule: item.vehicule?._id || item.vehicule,
      dateDepense: item.dateDepense ? new Date(item.dateDepense).toISOString().slice(0, 10) : ''
    });
  }
  function exportDepensesCsv() {
    const headers = ['Date', 'Véhicule', 'Catégorie', 'Montant', 'Kilométrage', 'Description'];
    const rows = depenses.map((item) => [
      new Date(item.dateDepense).toLocaleDateString('fr-FR'),
      item.vehicule?.immatriculation || '',
      label(item.categorie),
      item.montant,
      item.kilometrage ?? '',
      item.description || ''
    ]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'depenses-carlog-pro.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
  async function deleteDepense(id) {
    if (!window.confirm('Supprimer cette dépense ?')) return;
    try { await api.deleteDepense(id); setNotice('Dépense supprimée.'); await loadData(); } catch (exception) { handleError(exception); }
  }
  async function openVehicleHistory(vehicle) {
    try {
      const [entretiensResponse, documentsResponse, alertesResponse, depensesResponse] = await Promise.all([
        api.getEntretiens({ vehicule: vehicle._id, limit: 100 }),
        api.getDocuments({ vehicule: vehicle._id }),
        api.getAlertes({ vehicule: vehicle._id }),
        api.getDepenses({ vehicule: vehicle._id, limit: 100 })
      ]);
      setSelectedVehicleHistory({
        vehicle,
        items: asList(entretiensResponse),
        documents: asList(documentsResponse),
        alerts: asList(alertesResponse),
        expenses: asList(depensesResponse),
        assignments: assignments.filter((item) => String(item.vehicule?._id || item.vehicule) === String(vehicle._id))
      });
      setTab('vehicules');
    } catch (exception) { handleError(exception); }
  }
  async function changeEntretien(id, statut) {
    try { await api.updateEntretien(id, { statut }); setNotice('Entretien mis à jour.'); await loadData(); } catch (exception) { handleError(exception); }
  }
  async function deleteEntretien(id) {
    if (!window.confirm('Supprimer cet entretien ?')) return;
    try { await api.deleteEntretien(id); setNotice('Entretien supprimé.'); await loadData(); } catch (exception) { handleError(exception); }
  }
  async function finishAssignment(assignment) {
    const kmFin = window.prompt('Kilométrage de fin', String(assignment.kmDebut));
    if (kmFin === null) return;
    try { await api.terminerAffectation(assignment._id, { kmFin: Number(kmFin), dateFin: new Date().toISOString() }); setNotice('Affectation terminée.'); await loadData(); } catch (exception) { handleError(exception); }
  }
  async function saveUser(event) {
    event.preventDefault();
    try {
      const { nom, prenom, email, telephone, role } = userForm;
      const donneesUtilisateur = { nom, prenom, email, telephone, role };
      if (editingUser) {
        await api.updateUtilisateur(editingUser._id, donneesUtilisateur);
        setNotice('Utilisateur modifié.');
      } else {
        await api.addUtilisateur(userForm);
        setNotice('Utilisateur créé.');
      }
      setUserForm(userInitial); setEditingUser(null); await loadData();
    } catch (exception) { handleError(exception); }
  }
  async function disableUser(id) { if (!window.confirm('Désactiver cet utilisateur ?')) return; try { await api.disableUtilisateur(id); setNotice('Utilisateur désactivé.'); await loadData(); } catch (exception) { handleError(exception); } }
  async function reactivateUser(id) { try { await api.reactivateUtilisateur(id); setNotice('Utilisateur réactivé.'); await loadData(); } catch (exception) { handleError(exception); } }
  async function generateReport(event) {
    event.preventDefault();
    if (reportFilters.debut && reportFilters.fin && reportFilters.debut > reportFilters.fin) {
      setError('La date de début doit être antérieure ou égale à la date de fin.');
      return;
    }
    setError('');
    try {
      const [alertsResult, assignmentsResult, entretiensResult, depensesResult] = await Promise.allSettled([
        api.getAlertes(),
        api.getAffectations(),
        api.getEntretiens({ limit: 100 }),
        api.getDepenses({ ...coutsFilters, limit: 100 })
      ]);
      const report = construireRapport(reportFilters, {
        vehicles,
        alerts: alertsResult.status === 'fulfilled' ? asList(alertsResult.value) : alerts,
        assignments: assignmentsResult.status === 'fulfilled' ? asList(assignmentsResult.value) : assignments,
        entretiens: entretiensResult.status === 'fulfilled' ? asList(entretiensResult.value) : entretiens,
        depenses: depensesResult.status === 'fulfilled' ? asList(depensesResult.value) : depenses
      });
      setGeneratedReport(report);
      setNotice(`Rapport ${libellesRapport[reportFilters.type]} généré.`);
    } catch (exception) { handleError(exception); }
  }
  function exportReportCsv() {
    if (!generatedReport) return;
    const csv = [generatedReport.columns, ...generatedReport.rows]
      .map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';'))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-${reportFilters.type}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
  function exportReportPdf() {
    if (!generatedReport) return;
    const popup = window.open('', '_blank', 'noopener,noreferrer');
    if (!popup) { setError('Autorisez les fenêtres popup pour imprimer le rapport en PDF.'); return; }
    const escape = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
    popup.document.write(`<html><head><title>${escape(generatedReport.title)}</title><style>body{font-family:Arial,sans-serif;color:#0f172a;padding:24px}h1{font-size:22px}p{color:#475569}table{border-collapse:collapse;width:100%;margin-top:20px}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:12px}th{background:#f1f5f9}</style></head><body><h1>${escape(generatedReport.title)}</h1><p>${escape(generatedReport.subtitle)}</p><table><thead><tr>${generatedReport.columns.map((column) => `<th>${escape(column)}</th>`).join('')}</tr></thead><tbody>${generatedReport.rows.map((row) => `<tr>${row.map((value) => `<td>${escape(value)}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`);
    popup.document.close();
    popup.focus();
    popup.print();
  }

  if (canceled) return <div>
    <TopBar user={user} themeToggle={themeToggle} notificationCount={alerts.filter((item) => item.statut === 'active' || item.statut === 'en_cours').length} onHome={() => setTab('accueil')} onNotifications={() => setTab('alertes')} onMenuAction={(action) => {
      if (action === 'documents') setTab('documents');
      else if (action === 'profil') setTab('profil');
      else if (action === 'notifications') setTab('notifications');
      else if (action === 'entreprise' && isAdmin) setTab('entreprise');
      else setNotice(action === 'notifications'
        ? 'Les préférences de notification sont accessibles depuis le menu du profil.'
        : action === 'entreprise'
          ? (isAdmin ? 'Les paramètres de l’entreprise sont accessibles depuis l’administration des utilisateurs.' : 'Les paramètres de l’entreprise sont réservés à l’administrateur.')
          : 'Les informations de votre profil sont affichées dans le menu du profil.');
    }} onLogout={logout} />
    <main className="dashboard-container">
      <div className="page-heading"><div><p className="eyebrow">Gestion du compte</p><h1 className="dashboard-title">Abonnement suspendu</h1></div><button className="btn-secondary" onClick={refreshSubscription}>Actualiser le statut</button></div>
      <div className="notice error" role="status">L'abonnement de votre entreprise est résilié. L'accès aux données de la flotte est suspendu.</div>
      {isAdmin && <section className="workspace"><h2>{entrepriseInfo?.nom || 'Compte entreprise'}</h2><p>Statut : {entrepriseInfo?.statutAbonnement || 'résilié'} · Formule : {entrepriseInfo?.formuleAbonnement || 'non renseignée'}</p><p>Pour réactiver l'accès, contactez l'assistance CarLog Pro. La réactivation est gérée manuellement pour le moment.</p></section>}
    </main>
  </div>;

  const filteredAlerts = alerts.filter((item) => (!alertFilters.statut || item.statut === alertFilters.statut) && (!alertFilters.niveauUrgence || item.niveauUrgence === alertFilters.niveauUrgence) && (!alertFilters.vehicule || String(item.vehicule?._id || item.vehicule) === alertFilters.vehicule));
  const activeAlertCount = alerts.filter((item) => item.statut === 'active' || item.statut === 'en_cours').length;
  const activeAssignments = assignments.filter((item) => item.statut === 'en_cours');
  if (loading && !vehicles.length && !alerts.length) return <div className="dashboard-container"><p className="empty-state">Chargement des données de votre entreprise...</p></div>;
  const ouvrirAction = (destination, preparer) => {
    preparer?.();
    setTab(destination);
  };

  return <div>
    <TopBar user={user} themeToggle={themeToggle} notificationCount={activeAlertCount} onHome={() => setTab('accueil')} onNotifications={() => setTab('alertes')} onMenuAction={(action) => {
      if (action === 'documents') setTab('documents');
      else if (action === 'profil') setTab('profil');
      else if (action === 'notifications') setTab('notifications');
      else if (action === 'entreprise' && isAdmin) setTab('entreprise');
      else setNotice(action === 'notifications'
        ? 'Les préférences de notification sont accessibles depuis le menu du profil.'
        : action === 'entreprise'
          ? (isAdmin ? 'Les paramètres de l’entreprise sont accessibles depuis l’administration des utilisateurs.' : 'Les paramètres de l’entreprise sont réservés à l’administrateur.')
          : 'Les informations de votre profil sont affichées dans le menu du profil.');
    }} onLogout={logout} />
    <main className="dashboard-container">
      <div className="page-heading"><div><p className="eyebrow">Gestion de flotte</p><h1 className="dashboard-title">Votre espace de pilotage</h1></div></div>
      {error && <div className="notice error">{error}</div>}{notice && <div className="notice success">{notice}<button onClick={() => setNotice('')} aria-label="Fermer">×</button></div>}
      {readOnly && <div className="notice error" role="status">L'abonnement de votre entreprise est en attente de régularisation. L'espace est en lecture seule, sauf pour le signalement d'une alerte.{isAdmin && ' La régularisation est gérée manuellement pour le moment ; contactez l’assistance CarLog Pro.'}</div>}
      <nav className="tabs">{[['accueil', 'Vue d’ensemble'], ['vehicules', 'Véhicules'], ['entretiens', 'Entretiens'], ['couts', 'Coûts'], ['documents', 'Documents & contrats'], ['rapports', 'Rapports'], ['alertes', `Alertes (${activeAlertCount})`], ['affectations', 'Affectations'], ...(isAdmin ? [['utilisateurs', 'Utilisateurs']] : [])].map(([id, text]) => <button className={tab === id ? 'tab active' : 'tab'} key={id} onClick={() => setTab(id)}>{text}</button>)}</nav>
      {tab === 'accueil' && <Home {...{ stats, vehicles, alerts, assignments, entretiens, depenses, documents, openTab: setTab, ouvrirAction, canManageFleet, canManageMaintenance: !readOnly && ['admin', 'fleet_manager', 'mecanicien'].includes(user?.role), canManageCosts: !readOnly && ['admin', 'fleet_manager', 'comptable'].includes(user?.role), canManageDocuments: !readOnly && ['admin', 'fleet_manager', 'comptable'].includes(user?.role), setVehicleForm, setAssignmentForm, setEntretienForm, setDepenseForm, setReportFilters, setVehicleFilters, setEntretienFilters, setAlertFilters, setCoutsFilters }} />}
      {tab === 'vehicules' && <VehicleSection {...{ vehicleFilters, setVehicleFilters, pagination, loadData, canManageFleet, isAdmin: isAdmin && !readOnly, vehicles, vehicleForm, setVehicleForm, saveVehicle, editingVehicle, setEditingVehicle, archiveVehicle, openVehicleHistory, selectedVehicleHistory, setSelectedVehicleHistory, user, readOnly, setTab, setDepenseForm, setEntretienForm, setDocumentForm }} />}
      {tab === 'entretiens' && <EntretienSection {...{ entretiens, entretienFilters, setEntretienFilters, entretienForm, setEntretienForm, saveEntretien, changeEntretien, deleteEntretien, vehicles, canManageMaintenance: !readOnly && ['admin', 'fleet_manager', 'mecanicien'].includes(user?.role), isAdmin: isAdmin && !readOnly }} />}
      {tab === 'couts' && <CoutsSection {...{ depenses, coutsOverview, carburantOverview, coutsFilters, setCoutsFilters, loadData, depenseForm, setDepenseForm, editingDepense, setEditingDepense, saveDepense, editDepense, deleteDepense, exportDepensesCsv, vehicles, canManageCosts: !readOnly && ['admin', 'fleet_manager', 'comptable'].includes(user?.role), canDeleteCosts: !readOnly && ['admin', 'fleet_manager', 'comptable'].includes(user?.role) }} />}
      {tab === 'documents' && <DocumentSection {...{ documents, documentFilters, setDocumentFilters, documentForm, setDocumentForm, documentFile, setDocumentFile, saveDocument, downloadDocument, previewDocument, archiveDocument, deleteDocument, loadData, vehicles, canManageDocuments: !readOnly && ['admin', 'fleet_manager', 'comptable'].includes(user?.role), canDeleteDocuments: !readOnly && ['admin', 'fleet_manager'].includes(user?.role) }} />}
      {tab === 'rapports' && <RapportsSection {...{ reportFilters, setReportFilters, generateReport, generatedReport, exportReportCsv, exportReportPdf, vehicles }} />}
      {tab === 'profil' && <ProfileSection user={user} profileForm={profileForm} setProfileForm={setProfileForm} onSubmit={saveProfile} onCancel={() => setProfileForm({ ...profileInitial, nom: user?.nom || '', prenom: user?.prenom || '', email: user?.email || '', telephone: user?.telephone || '' })} />}
      {tab === 'notifications' && <NotificationsSection form={notificationsForm} setForm={setNotificationsForm} onSubmit={saveNotifications} onCancel={() => setNotificationsForm({ ...notificationsInitial, ...(user?.notifications || {}) })} />}
      {tab === 'entreprise' && isAdmin && (
        <EntrepriseSettingsSection
          form={entrepriseForm}
          setForm={setEntrepriseForm}
          onSubmit={saveEntreprise}
          onCancel={() => {
            const entreprise = entrepriseInfo || {};
            setEntrepriseForm({
              ...entrepriseInitial,
              ...entreprise,
              adresse: { ...entrepriseInitial.adresse, ...(entreprise.adresse || {}) },
            });
          }}
        />
      )}
      {tab === 'alertes' && <AlertSection {...{ alertFilters, setAlertFilters, filteredAlerts, alertForm, setAlertForm, vehicles, users, saveAlert, canModifyAlerts, isAdmin: isAdmin && !readOnly, changeAlert, deleteAlert, onViewVehicle: (vehicle) => { setVehicleFilters({ ...vehicleFilters, search: vehicle.immatriculation }); setTab('vehicules'); } }} />}
      {tab === 'affectations' && <AssignmentSection {...{ assignments, activeAssignments, canManageFleet, vehicles, users, assignmentForm, setAssignmentForm, saveAssignment, editingAssignment, setEditingAssignment, finishAssignment }} />}
      {tab === 'utilisateurs' && isAdmin && <UserSection {...{ users, user, userForm, setUserForm, saveUser, disableUser, reactivateUser, editingUser, setEditingUser, readOnly }} />}
      <PiedDePageLegal />
    </main>
  </div>;
}

function Home({ stats, vehicles, alerts, assignments, entretiens, depenses, documents, openTab, ouvrirAction, canManageFleet, canManageMaintenance, canManageCosts, canManageDocuments, setVehicleForm, setAssignmentForm, setEntretienForm, setDepenseForm, setReportFilters, setVehicleFilters, setEntretienFilters, setAlertFilters, setCoutsFilters }) {
  const counts = stats?.vehicules || {};
  const actifs = vehicles.length;
  const disponibles = vehicles.filter((item) => item.statut === 'disponible').length;
  const enCirculation = vehicles.filter((item) => item.statut === 'en_course').length;
  const enEntretien = vehicles.filter((item) => item.statut === 'en_maintenance').length;
  const immobilises = vehicles.filter((item) => item.statut === 'en_panne').length;
  const alertesActives = alerts.filter((item) => item.statut === 'active' || item.statut === 'en_cours');
  const entretiensAVenir = entretiens.filter((item) => item.statut !== 'realise' && new Date(item.dateEntretien) >= new Date());
  const entretiensEnRetard = entretiens.filter((item) => item.statut !== 'realise' && new Date(item.dateEntretien) < new Date());
  const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const depensesMois = depenses.filter((item) => new Date(item.dateDepense) >= debutMois);
  const totalMois = depensesMois.reduce((sum, item) => sum + (Number(item.montant) || 0), 0);
  const echeances = documents.filter((item) => ['a_renouveler', 'urgent', 'expire'].includes(item.statut)).slice(0, 5);
  const recentes = [...vehicles].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 5);
  const ouvrirFiltre = (tab, filtre) => { filtre?.(); openTab(tab); };
  const filtreVehicleStatus = (status) => { setVehicleFilters({ search: '', typeVehicule: '', statut: status, page: 1 }); };
  return <><div className="quick-actions"><strong>Actions rapides</strong><div className="item-actions">{canManageFleet && <button className="btn-primary" onClick={() => ouvrirAction('vehicules', () => setVehicleForm(vehicleInitial))}>+ Ajouter un véhicule</button>}{canManageFleet && <button className="btn-secondary" onClick={() => ouvrirAction('affectations', () => setAssignmentForm(assignmentInitial))}>+ Créer une affectation</button>}{canManageMaintenance && <button className="btn-secondary" onClick={() => ouvrirAction('entretiens', () => setEntretienForm(entretienInitial))}>+ Planifier un entretien</button>}{canManageCosts && <><button className="btn-secondary" onClick={() => ouvrirAction('couts', () => setDepenseForm(depenseInitial))}>+ Ajouter une dépense</button><button className="btn-secondary" onClick={() => ouvrirAction('couts', () => setDepenseForm({ ...depenseInitial, categorie: 'carburant' }))}>+ Enregistrer un plein</button></>}</div></div><div className="kpi-grid"><Kpi title="Véhicules actifs" value={counts.total ?? actifs} onClick={() => { setVehicleFilters({ search: '', typeVehicule: '', statut: '', page: 1 }); openTab('vehicules'); }} /><Kpi title="Disponibles" value={counts.disponible ?? disponibles} onClick={() => ouvrirFiltre('vehicules', () => filtreVehicleStatus('disponible'))} /><Kpi title="En circulation" value={counts.en_course ?? enCirculation} onClick={() => ouvrirFiltre('vehicules', () => filtreVehicleStatus('en_course'))} /><Kpi title="En entretien" value={counts.en_maintenance ?? enEntretien} onClick={() => ouvrirFiltre('vehicules', () => filtreVehicleStatus('en_maintenance'))} /><Kpi title="Immobilisés" value={counts.en_panne ?? immobilises} onClick={() => ouvrirFiltre('vehicules', () => filtreVehicleStatus('en_panne'))} /><Kpi title="Alertes actives" value={alertesActives.length} onClick={() => { setAlertFilters({ statut: 'active', niveauUrgence: '', vehicule: '' }); openTab('alertes'); }} /><Kpi title="Entretiens à venir" value={entretiensAVenir.length} onClick={() => { setEntretienFilters({ statut: 'planifie', typeEntretien: '' }); openTab('entretiens'); }} /><Kpi title="Entretiens en retard" value={entretiensEnRetard.length} onClick={() => { setEntretienFilters({ statut: '', typeEntretien: '' }); openTab('entretiens'); }} /><Kpi title="Dépenses du mois" value={`${totalMois.toFixed(2)} €`} onClick={() => { setCoutsFilters({ debut: debutMois.toISOString().slice(0, 10), fin: new Date().toISOString().slice(0, 10), vehicule: '', categorie: '' }); openTab('couts'); }} /><Kpi title="Coût moyen par véhicule" value={`${(actifs ? totalMois / actifs : 0).toFixed(2)} €`} onClick={() => openTab('couts')} /></div><div className="dashboard-grid"><ListCard title="Véhicules récents" items={recentes} onOpen={() => openTab('vehicules')} render={(item) => <><strong>{item.marque} {item.modele}</strong><small>{item.immatriculation} · {label(item.statut)}</small></>} /><ListCard title="Alertes récentes" items={alerts.slice(0, 5)} onOpen={() => openTab('alertes')} render={(item) => <><strong>{item.titre}</strong><small>{item.vehicule?.immatriculation || 'Flotte'} · {libellesUrgence[item.niveauUrgence] || item.niveauUrgence}</small></>} /><ListCard title="Échéances proches" items={echeances} onOpen={() => openTab('documents')} render={(item) => <><strong>{item.nomOriginal}</strong><small>{item.vehicule?.immatriculation || '—'} · {new Date(item.dateEcheance).toLocaleDateString('fr-FR')}</small></>} /></div><div className="dashboard-grid"><section className="card-section"><div className="section-header"><h2>Répartition de la flotte</h2><button className="link-button" onClick={() => openTab('vehicules')}>Voir tout</button></div>{statutsVehicule.map((status) => <div className="stat-row" key={status}><span>{label(status)}</span><strong>{counts[status] ?? vehicles.filter((item) => item.statut === status).length}</strong><div className="bar"><i style={{ width: `${actifs ? (counts[status] ?? vehicles.filter((item) => item.statut === status).length) / actifs * 100 : 0}%` }} /></div></div>)}</section><section className="card-section"><div className="section-header"><h2>Répartition des dépenses</h2><button className="link-button" onClick={() => openTab('couts')}>Voir tout</button></div>{categoriesDepense.map((category) => { const total = depensesMois.filter((item) => item.categorie === category).reduce((sum, item) => sum + (Number(item.montant) || 0), 0); return <div className="stat-row" key={category}><span>{label(category)}</span><strong>{total.toFixed(2)} €</strong><div className="bar"><i style={{ width: `${totalMois ? total / totalMois * 100 : 0}%` }} /></div></div>; })}</section></div></>;
}
function Kpi({ title, value, onClick }) { return <article className={`kpi${onClick ? ' kpi-clickable' : ''}`} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}><small>{title}</small><strong>{value}</strong></article>; }
function ListCard({ title, items, onOpen, render }) { return <section className="card-section"><div className="section-header"><h2>{title}</h2><button className="link-button" onClick={onOpen}>Voir tout</button></div>{items.map((item) => <div className="data-item" key={item._id}><div>{render ? render(item) : <><strong>{item.marque ? `${item.marque} ${item.modele}` : item.titre}</strong><small>{item.immatriculation || `${item.typeAlerte} · ${item.niveauUrgence}`}</small></>}</div><span className="status">{label(item.statut)}</span></div>)}{!items.length && <p className="empty-state">Aucune donnée pour le moment.</p>}</section>; }
function Field({ label: title, children }) { return <label className="field"><span>{title}</span>{children}</label>; }

function construireRapport(filters, donnees) {
  const debut = filters.debut ? new Date(`${filters.debut}T00:00:00.000Z`) : null;
  const fin = filters.fin ? new Date(`${filters.fin}T23:59:59.999Z`) : null;
  const vehicleId = filters.vehicule;
  const dansPeriode = (item, champ) => {
    const value = item[champ] || item.createdAt;
    if (!value) return true;
    const date = new Date(value);
    return (!debut || date >= debut) && (!fin || date <= fin);
  };
  const duVehicule = (item) => !vehicleId || String(item.vehicule?._id || item.vehicule) === vehicleId;
  const nomVehicule = (item) => item.vehicule?.immatriculation || 'Non associé';
  let columns;
  let rows;
  let source;
  switch (filters.type) {
    case 'couts':
      source = donnees.depenses.filter((item) => duVehicule(item) && dansPeriode(item, 'dateDepense'));
      columns = ['Date', 'Véhicule', 'Catégorie', 'Montant (€)', 'Kilométrage', 'Description'];
      rows = source.map((item) => [dateFr(item.dateDepense), nomVehicule(item), label(item.categorie), item.montant, item.kilometrage ?? '', item.description || '']);
      break;
    case 'carburant':
      source = donnees.depenses.filter((item) => item.categorie === 'carburant' && duVehicule(item) && dansPeriode(item, 'dateDepense'));
      columns = ['Date', 'Véhicule', 'Litres', 'Prix/L (€)', 'Montant (€)', 'Kilométrage'];
      rows = source.map((item) => [dateFr(item.dateDepense), nomVehicule(item), item.litres ?? '', item.prixAuLitre ?? '', item.montant, item.kilometrage ?? '']);
      break;
    case 'entretiens':
      source = donnees.entretiens.filter((item) => duVehicule(item) && dansPeriode(item, 'dateEntretien'));
      columns = ['Date', 'Véhicule', 'Type', 'Statut', 'Coût (€)', 'Kilométrage'];
      rows = source.map((item) => [dateFr(item.dateEntretien), nomVehicule(item), label(item.typeEntretien), label(item.statut), item.cout ?? 0, item.kilometrageReel ?? item.kilometragePrevisionnel ?? '']);
      break;
    case 'alertes':
      source = donnees.alerts.filter((item) => duVehicule(item) && dansPeriode(item, 'createdAt'));
      columns = ['Date', 'Véhicule', 'Titre', 'Type', 'Urgence', 'Statut'];
      rows = source.map((item) => [dateFr(item.createdAt), nomVehicule(item), item.titre, label(item.typeAlerte), item.niveauUrgence, label(item.statut)]);
      break;
    case 'affectations':
      source = donnees.assignments.filter((item) => duVehicule(item) && dansPeriode(item, 'dateDebut'));
      columns = ['Début', 'Fin', 'Véhicule', 'Statut', 'Km début', 'Km fin'];
      rows = source.map((item) => [dateFr(item.dateDebut), dateFr(item.dateFin), nomVehicule(item), label(item.statut), item.kmDebut, item.kmFin ?? '']);
      break;
    default:
      source = [
        ...donnees.depenses.filter((item) => duVehicule(item) && dansPeriode(item, 'dateDepense')).map((item) => ({ date: item.dateDepense, type: 'Coût', vehicle: nomVehicule(item), detail: label(item.categorie), amount: `${item.montant} €` })),
        ...donnees.entretiens.filter((item) => duVehicule(item) && dansPeriode(item, 'dateEntretien')).map((item) => ({ date: item.dateEntretien, type: 'Entretien', vehicle: nomVehicule(item), detail: label(item.typeEntretien), amount: `${item.cout ?? 0} €` })),
        ...donnees.alerts.filter((item) => duVehicule(item) && dansPeriode(item, 'createdAt')).map((item) => ({ date: item.createdAt, type: 'Alerte', vehicle: nomVehicule(item), detail: item.titre, amount: label(item.statut) })),
        ...donnees.assignments.filter((item) => duVehicule(item) && dansPeriode(item, 'dateDebut')).map((item) => ({ date: item.dateDebut, type: 'Affectation', vehicle: nomVehicule(item), detail: label(item.statut), amount: `${item.kmDebut ?? ''} km` }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
      columns = ['Date', 'Type', 'Véhicule', 'Détail', 'Valeur'];
      rows = source.map((item) => [dateFr(item.date), item.type, item.vehicle, item.detail, item.amount]);
  }
  const periode = `${filters.debut || 'Début'} → ${filters.fin || 'Aujourd’hui'}`;
  return { title: `Rapport ${libellesRapport[filters.type]}`, subtitle: `Période : ${periode} · ${rows.length} élément(s)`, columns, rows };
}

function dateFr(value) {
  return value ? new Date(value).toLocaleDateString('fr-FR') : '';
}

function RapportsSection({ reportFilters, setReportFilters, generateReport, generatedReport, exportReportCsv, exportReportPdf, vehicles }) {
  return <section className="workspace">
    <div className="section-header"><div><p className="eyebrow">Analyse et partage</p><h2>Rapports</h2></div></div>
    <form className="form-panel" onSubmit={generateReport}>
      <div className="form-grid">
        <Field label="Type de rapport"><select value={reportFilters.type} onChange={(event) => setReportFilters({ ...reportFilters, type: event.target.value })}>{typesRapport.map((type) => <option key={type} value={type}>{libellesRapport[type]}</option>)}</select></Field>
        <Field label="Du"><input type="date" value={reportFilters.debut} onChange={(event) => setReportFilters({ ...reportFilters, debut: event.target.value })} /></Field>
        <Field label="Au"><input type="date" value={reportFilters.fin} onChange={(event) => setReportFilters({ ...reportFilters, fin: event.target.value })} /></Field>
        <Field label="Véhicule"><select value={reportFilters.vehicule} onChange={(event) => setReportFilters({ ...reportFilters, vehicule: event.target.value })}><option value="">Toute la flotte</option>{vehicles.map((vehicle) => <option key={vehicle._id} value={vehicle._id}>{vehicle.immatriculation} · {vehicle.marque} {vehicle.modele}</option>)}</select></Field>
      </div>
      <button className="btn-primary">Générer le rapport</button>
    </form>
    {generatedReport ? <><div className="section-header"><div><h3>{generatedReport.title}</h3><small>{generatedReport.subtitle}</small></div><div className="item-actions"><button className="btn-secondary" onClick={exportReportCsv}>Télécharger en CSV</button><button className="btn-primary" onClick={exportReportPdf}>Télécharger en PDF</button></div></div>{generatedReport.rows.length ? <div className="table-wrap"><table><thead><tr>{generatedReport.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{generatedReport.rows.map((row, index) => <tr key={`${index}-${row[0]}`}>{row.map((value, cellIndex) => <td key={`${index}-${cellIndex}`}>{value}</td>)}</tr>)}</tbody></table></div> : <p className="empty-state">Aucune donnée ne correspond aux critères sélectionnés.</p>}</> : <p className="empty-state">Choisissez les critères puis générez un rapport.</p>}
  </section>;
}

function VehicleSection({ vehicleFilters, setVehicleFilters, pagination, loadData, canManageFleet, isAdmin, vehicles, vehicleForm, setVehicleForm, saveVehicle, editingVehicle, setEditingVehicle, archiveVehicle, openVehicleHistory, selectedVehicleHistory, setSelectedVehicleHistory, user, readOnly, setTab, setDepenseForm, setEntretienForm, setDocumentForm }) {
  return <section className="workspace">
    <div className="section-header"><div><p className="eyebrow">Parc automobile</p><h2>Véhicules <span className="count-badge">{pagination.totalItems}</span></h2></div></div>
    <div className="toolbar"><input placeholder="Plaque, marque, modèle" value={vehicleFilters.search} onChange={(e) => setVehicleFilters({ ...vehicleFilters, search: e.target.value })} /><select value={vehicleFilters.typeVehicule} onChange={(e) => setVehicleFilters({ ...vehicleFilters, typeVehicule: e.target.value })}><option value="">Tous les types</option>{typesVehicule.map((item) => <option key={item}>{item}</option>)}</select><select value={vehicleFilters.statut} onChange={(e) => setVehicleFilters({ ...vehicleFilters, statut: e.target.value })}><option value="">Tous les statuts</option>{statutsVehicule.map((item) => <option key={item}>{item}</option>)}</select><button className="btn-primary" onClick={() => loadData()}>Rechercher</button></div>
    {selectedVehicleHistory && <VehicleDetail {...{ selectedVehicleHistory, setSelectedVehicleHistory, canManageFleet, isAdmin, readOnly, setTab, setDepenseForm, setEntretienForm, setDocumentForm, setEditingVehicle, setVehicleForm, archiveVehicle }} />}
    {canManageFleet && <VehicleForm form={vehicleForm} setForm={setVehicleForm} submit={saveVehicle} editing={editingVehicle} cancel={() => { setEditingVehicle(null); setVehicleForm(vehicleInitial); }} />}
    {vehicles.length ? <div className="table-wrap"><table><thead><tr><th>Véhicule</th><th>Type</th><th>Kilométrage</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{vehicles.map((item) => <tr key={item._id}><td><strong>{item.marque} {item.modele}</strong><small>{item.immatriculation} · {item.annee || 'année non renseignée'}</small></td><td>{item.typeVehicule}</td><td>{item.kilometrage} km</td><td><span className="status">{label(item.statut)}</span></td><td><button className="link-button" onClick={() => openVehicleHistory(item)}>Ouvrir la fiche</button>{canManageFleet && <button className="link-button" onClick={() => { setEditingVehicle(item); setVehicleForm({ ...vehicleInitial, ...item }); }}>Modifier</button>}{isAdmin && <button className="link-button danger" onClick={() => archiveVehicle(item._id)}>Archiver</button>}</td></tr>)}</tbody></table></div> : <p className="empty-state">Aucun véhicule ne correspond à vos critères.</p>}
    <Pagination data={pagination} change={(page) => { setVehicleFilters({ ...vehicleFilters, page }); loadData({ page }); }} />
  </section>;
}

function VehicleDetail({ selectedVehicleHistory, setSelectedVehicleHistory, canManageFleet, isAdmin, readOnly, setTab, setDepenseForm, setEntretienForm, setDocumentForm, setEditingVehicle, setVehicleForm, archiveVehicle }) {
  const { vehicle, items, documents = [], alerts = [], expenses = [], assignments = [] } = selectedVehicleHistory;
  const nextEntretien = items.filter((item) => item.statut !== 'realise' && new Date(item.dateEntretien) >= new Date()).sort((a, b) => new Date(a.dateEntretien) - new Date(b.dateEntretien))[0];
  const totalCost = expenses.reduce((sum, item) => sum + (Number(item.montant) || 0), 0) + items.reduce((sum, item) => sum + (Number(item.cout) || 0), 0);
  const kmValues = expenses.map((item) => Number(item.kilometrage)).filter(Number.isFinite);
  const distance = kmValues.length > 1 ? Math.max(...kmValues) - Math.min(...kmValues) : 0;
  const fuel = expenses.filter((item) => item.categorie === 'carburant');
  const litres = fuel.reduce((sum, item) => sum + (Number(item.litres) || 0), 0);
  const consommation = distance > 0 ? litres / distance * 100 : null;
  const goTo = (tab, setup) => { setup(); setSelectedVehicleHistory(null); setTab(tab); };
  return <section className="vehicle-detail card-section">
    <div className="section-header"><div><p className="eyebrow">Fiche véhicule</p><h3>{vehicle.marque} {vehicle.modele} · {vehicle.immatriculation}</h3></div><div className="item-actions">{canManageFleet && <button className="btn-secondary" onClick={() => { setEditingVehicle(vehicle); setVehicleForm({ ...vehicleInitial, ...vehicle }); setSelectedVehicleHistory(null); }}>Modifier</button>}{isAdmin && <button className="link-button danger" onClick={() => archiveVehicle(vehicle._id)}>Archiver le véhicule</button>}<button className="link-button" onClick={() => setSelectedVehicleHistory(null)}>Fermer</button></div></div>
    {vehicle.photoUrl && <img className="vehicle-photo" src={vehicle.photoUrl} alt={`Photo de ${vehicle.marque} ${vehicle.modele}`} />}
    <div className="kpi-grid"><Kpi title="Kilométrage actuel" value={`${vehicle.kilometrage ?? 0} km`} /><Kpi title="Coût total de possession" value={`${totalCost.toFixed(2)} €`} /><Kpi title="Coût par kilomètre" value={distance ? `${(totalCost / distance).toFixed(2)} €/km` : '—'} /><Kpi title="Consommation moyenne" value={consommation ? `${consommation.toFixed(2)} L/100 km` : '—'} /></div>
    <div className="vehicle-info-grid"><div><strong>Informations générales</strong><p>Marque et modèle : {vehicle.marque} {vehicle.modele}<br />Immatriculation : {vehicle.immatriculation}<br />Type : {label(vehicle.typeVehicule)}<br />Statut : {label(vehicle.statut)}<br />Mise en circulation : {vehicle.dateMiseEnService ? new Date(vehicle.dateMiseEnService).toLocaleDateString('fr-FR') : vehicle.annee || '—'}</p></div><div><strong>Prochain entretien</strong><p>{nextEntretien ? `${label(nextEntretien.typeEntretien)} · ${new Date(nextEntretien.dateEntretien).toLocaleDateString('fr-FR')}` : 'Aucun entretien planifié.'}</p><strong>Affectation actuelle</strong><p>{assignments.find((item) => item.statut === 'en_cours')?.conducteur?.prenom || 'Aucun conducteur affecté'}</p></div></div>
    <div className="vehicle-actions"><button className="btn-secondary" onClick={() => goTo('couts', () => setDepenseForm({ ...depenseInitial, vehicule: vehicle._id }))}>Ajouter une dépense</button><button className="btn-secondary" onClick={() => goTo('couts', () => setDepenseForm({ ...depenseInitial, vehicule: vehicle._id, categorie: 'carburant' }))}>Enregistrer un plein</button><button className="btn-secondary" onClick={() => goTo('entretiens', () => setEntretienForm({ ...entretienInitial, vehicule: vehicle._id }))}>Planifier un entretien</button><button className="btn-secondary" onClick={() => goTo('documents', () => setDocumentForm({ ...documentInitial, vehicule: vehicle._id }))}>Ajouter un document</button></div>
    <DetailList title="Historique des affectations" items={assignments} empty="Aucune affectation." render={(item) => `${new Date(item.dateDebut).toLocaleDateString('fr-FR')} · ${label(item.statut)} · ${item.kmDebut} km`} />
    <DetailList title="Historique des entretiens" items={items} empty="Aucun entretien." render={(item) => `${label(item.typeEntretien)} · ${new Date(item.dateEntretien).toLocaleDateString('fr-FR')} · ${item.cout || 0} €`} />
    <DetailList title="Alertes liées au véhicule" items={alerts} empty="Aucune alerte." render={(item) => `${item.titre} · ${label(item.statut)}`} />
    <DetailList title="Documents et contrats liés" items={documents} empty="Aucun document." render={(item) => `${item.nomOriginal} · échéance ${new Date(item.dateEcheance).toLocaleDateString('fr-FR')}`} />
    <DetailList title="Historique des dépenses" items={expenses} empty="Aucune dépense." render={(item) => `${new Date(item.dateDepense).toLocaleDateString('fr-FR')} · ${label(item.categorie)} · ${item.montant} €`} />
  </section>;
}

function DetailList({ title, items, empty, render }) {
  return <div className="detail-list"><h4>{title}</h4>{items.length ? <ul>{items.map((item) => <li key={item._id}>{render(item)}</li>)}</ul> : <p className="empty-state">{empty}</p>}</div>;
}
function VehicleForm({ form, setForm, submit, editing, cancel }) { return <form className="form-panel" onSubmit={submit}><div className="form-heading"><h3>{editing ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h3>{editing && <button type="button" className="link-button" onClick={cancel}>Annuler</button>}</div><div className="form-grid"><Field label="Immatriculation"><input required value={form.immatriculation} onChange={(e) => setForm({ ...form, immatriculation: e.target.value })} /></Field><Field label="Marque"><input required value={form.marque} onChange={(e) => setForm({ ...form, marque: e.target.value })} /></Field><Field label="Modèle"><input required value={form.modele} onChange={(e) => setForm({ ...form, modele: e.target.value })} /></Field><Field label="Photo (URL facultative)"><input type="url" placeholder="https://..." value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} /></Field><Field label="Type"><select value={form.typeVehicule} onChange={(e) => setForm({ ...form, typeVehicule: e.target.value })}>{typesVehicule.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Année"><input type="number" value={form.annee} onChange={(e) => setForm({ ...form, annee: e.target.value })} /></Field><Field label="Mise en circulation"><input type="date" value={form.dateMiseEnService ? String(form.dateMiseEnService).slice(0, 10) : ''} onChange={(e) => setForm({ ...form, dateMiseEnService: e.target.value })} /></Field><Field label="PTAC (kg)"><input required min="1" type="number" value={form.ptac} onChange={(e) => setForm({ ...form, ptac: e.target.value })} /></Field><Field label="Carburant"><select value={form.carburant} onChange={(e) => setForm({ ...form, carburant: e.target.value })}>{carburants.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Kilométrage"><input min="0" type="number" value={form.kilometrage} onChange={(e) => setForm({ ...form, kilometrage: e.target.value })} /></Field>{editing && <Field label="Statut"><select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>{statutsVehicule.map((item) => <option key={item}>{item}</option>)}</select></Field>}</div><button className="btn-primary">{editing ? 'Enregistrer' : 'Ajouter le véhicule'}</button></form>; }

function EntretienSection({ entretiens, entretienFilters, setEntretienFilters, entretienForm, setEntretienForm, saveEntretien, changeEntretien, deleteEntretien, vehicles, canManageMaintenance, isAdmin }) {
  const visibles = entretiens.filter((item) => (!entretienFilters.statut || item.statut === entretienFilters.statut.replaceAll(' ', '_')) && (!entretienFilters.typeEntretien || item.typeEntretien === entretienFilters.typeEntretien.replaceAll(' ', '_')));
  return <section className="workspace"><div className="section-header"><div><p className="eyebrow">Carnet de maintenance</p><h2>Entretiens <span className="count-badge">{visibles.length}</span></h2></div></div><div className="toolbar"><select value={entretienFilters.statut} onChange={(e) => setEntretienFilters({ ...entretienFilters, statut: e.target.value })}><option value="">Tous les statuts</option>{statutsEntretien.map((item) =>   <option key={item} value={item}>{label(item)}</option>)}</select><select value={entretienFilters.typeEntretien} onChange={(e) => setEntretienFilters({ ...entretienFilters, typeEntretien: e.target.value })}><option value="">Tous les types</option>{typesEntretien.map((item) => <option key={item}>{label(item)}</option>)}</select></div>{canManageMaintenance && <form className="form-panel" onSubmit={saveEntretien}><div className="form-heading"><h3>Ajouter un entretien</h3><small>Le véhicule et la date sont obligatoires.</small></div><div className="form-grid"><Field label="Véhicule"><select required value={entretienForm.vehicule} onChange={(e) => setEntretienForm({ ...entretienForm, vehicule: e.target.value })}><option value="">Sélectionner</option>{vehicles.map((item) => <option key={item._id} value={item._id}>{item.immatriculation} · {item.marque} {item.modele}</option>)}</select></Field><Field label="Type"><select value={entretienForm.typeEntretien} onChange={(e) => setEntretienForm({ ...entretienForm, typeEntretien: e.target.value })}>{typesEntretien.map((item) => <option key={item}>{label(item)}</option>)}</select></Field><Field label="Date"><input required type="date" value={entretienForm.dateEntretien} onChange={(e) => setEntretienForm({ ...entretienForm, dateEntretien: e.target.value })} /></Field><Field label="Statut"><select value={entretienForm.statut} onChange={(e) => setEntretienForm({ ...entretienForm, statut: e.target.value })}>{statutsEntretien.map((item) => <option key={item}>{label(item)}</option>)}</select></Field><Field label="Km prévisionnel"><input min="0" type="number" value={entretienForm.kilometragePrevisionnel} onChange={(e) => setEntretienForm({ ...entretienForm, kilometragePrevisionnel: e.target.value })} /></Field><Field label="Km réel"><input min="0" type="number" value={entretienForm.kilometrageReel} onChange={(e) => setEntretienForm({ ...entretienForm, kilometrageReel: e.target.value })} /></Field><Field label="Coût (€)"><input min="0" step="0.01" type="number" value={entretienForm.cout} onChange={(e) => setEntretienForm({ ...entretienForm, cout: e.target.value })} /></Field><Field label="Description"><textarea maxLength="2000" value={entretienForm.description} onChange={(e) => setEntretienForm({ ...entretienForm, description: e.target.value })} /></Field></div><button className="btn-primary">Enregistrer l’entretien</button></form>}{visibles.length ? <div className="table-wrap"><table><thead><tr><th>Véhicule</th><th>Intervention</th><th>Date</th><th>Kilométrage</th><th>Coût</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{visibles.map((item) => <tr key={item._id}><td>{item.vehicule?.immatriculation || 'Véhicule indisponible'}</td><td><strong>{label(item.typeEntretien)}</strong><small>{item.description || 'Sans description'}</small></td><td>{new Date(item.dateEntretien).toLocaleDateString('fr-FR')}</td><td>{item.kilometrageReel ?? item.kilometragePrevisionnel ?? '—'} km</td><td>{Number(item.cout || 0).toFixed(2)} €</td><td><span className="status">{label(item.statut)}</span></td><td>{canManageMaintenance && item.statut !== 'realise' && <button className="link-button" onClick={() => changeEntretien(item._id, item.statut === 'planifie' ? 'en_cours' : 'realise')}>{item.statut === 'planifie' ? 'Démarrer' : 'Terminer'}</button>}{isAdmin && <button className="link-button danger" onClick={() => deleteEntretien(item._id)}>Supprimer</button>}</td></tr>)}</tbody></table></div> : <p className="empty-state">Aucun entretien pour ces critères.</p>}</section>;
}

function AlertSection({ alertFilters, setAlertFilters, filteredAlerts, alertForm, setAlertForm, vehicles, users, saveAlert, canModifyAlerts, isAdmin, changeAlert, deleteAlert, onViewVehicle }) { return <section className="workspace"><div className="section-header"><div><p className="eyebrow">Suivi des incidents</p><h2>Alertes <span className="count-badge">{filteredAlerts.length}</span></h2></div></div><div className="toolbar"><select value={alertFilters.statut} onChange={(e) => setAlertFilters({ ...alertFilters, statut: e.target.value })}><option value="">Tous les statuts</option>{statutsAlerte.map((item) => <option key={item} value={item}>{libellesStatutAlerte[item]}</option>)}</select><select value={alertFilters.niveauUrgence} onChange={(e) => setAlertFilters({ ...alertFilters, niveauUrgence: e.target.value })}><option value="">Toutes les priorités</option>{urgences.map((item) => <option key={item} value={item}>{libellesUrgence[item]}</option>)}</select><select value={alertFilters.vehicule} onChange={(e) => setAlertFilters({ ...alertFilters, vehicule: e.target.value })}><option value="">Tous les véhicules</option>{vehicles.map((item) => <option key={item._id} value={item._id}>{item.immatriculation}</option>)}</select></div><AlertForm form={alertForm} setForm={setAlertForm} vehicles={vehicles} users={users} submit={saveAlert} />{filteredAlerts.length ? <div className="data-list">{filteredAlerts.map((item) => <article className="data-item" key={item._id}><div><strong>{item.titre}</strong><small>{label(item.typeAlerte)} · {libellesUrgence[item.niveauUrgence] || item.niveauUrgence} · {item.vehicule?.immatriculation || 'Flotte'}</small><p>{item.description || 'Aucune description.'}</p><small>Créée le {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : '—'}</small></div><div className="item-actions"><span className="status">{libellesStatutAlerte[item.statut] || label(item.statut)}</span>{canModifyAlerts && (item.statut === 'active' || item.statut === 'en_cours') && <><button className="link-button" onClick={() => changeAlert(item._id, 'resolue')}>Marquer comme traitée</button><button className="link-button" onClick={() => changeAlert(item._id, 'acquittee')}>Ignorer</button></>}{item.vehicule && <button className="link-button" onClick={() => onViewVehicle(item.vehicule)}>Voir le véhicule</button>}{isAdmin && <button className="link-button danger" onClick={() => deleteAlert(item._id)}>Supprimer</button>}</div></article>)}</div> : <p className="empty-state">Aucune alerte pour ces critères.</p>}</section>; }
function AlertForm({ form, setForm, vehicles, users, submit }) { return <form className="form-panel" onSubmit={submit}><div className="form-heading"><h3>Signaler une alerte</h3></div><div className="form-grid"><Field label="Titre"><input required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} /></Field><Field label="Type"><select value={form.typeAlerte} onChange={(e) => setForm({ ...form, typeAlerte: e.target.value })}>{typesAlerte.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Priorité"><select value={form.niveauUrgence} onChange={(e) => setForm({ ...form, niveauUrgence: e.target.value })}>{urgences.map((item) => <option key={item} value={item}>{libellesUrgence[item]}</option>)}</select></Field><Field label="Véhicule"><select value={form.vehicule} onChange={(e) => setForm({ ...form, vehicule: e.target.value })}><option value="">Non précisé</option>{vehicles.map((item) => <option key={item._id} value={item._id}>{item.immatriculation} · {item.modele}</option>)}</select></Field><Field label="Conducteur"><select value={form.conducteur} onChange={(e) => setForm({ ...form, conducteur: e.target.value })}><option value="">Non précisé</option>{users.filter((item) => item.role === 'conducteur' && item.actif).map((item) => <option key={item._id} value={item._id}>{item.prenom} {item.nom}</option>)}</select></Field><Field label="Description"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field></div><button className="btn-primary">Créer l'alerte</button></form>; }

function AssignmentSection({ assignments, activeAssignments, canManageFleet, vehicles, users, assignmentForm, setAssignmentForm, saveAssignment, editingAssignment, setEditingAssignment, finishAssignment }) { return <section className="workspace"><div className="section-header"><div><p className="eyebrow">Missions et conducteurs</p><h2>Affectations <span className="count-badge">{activeAssignments.length} en cours</span></h2></div></div>{canManageFleet && <AssignmentForm form={assignmentForm} setForm={setAssignmentForm} vehicles={vehicles} users={users} submit={saveAssignment} editing={editingAssignment} cancel={() => { setEditingAssignment(null); setAssignmentForm(assignmentInitial); }} />}{assignments.length ? <div className="data-list">{assignments.map((item) => <article className="data-item" key={item._id}><div><strong>{item.vehicule?.immatriculation || 'Véhicule'}</strong><small>{item.vehicule?.marque} {item.vehicule?.modele} · conducteur : {item.conducteur?.prenom} {item.conducteur?.nom}</small><p>Début : {new Date(item.dateDebut).toLocaleDateString('fr-FR')} · {item.kmDebut} km {item.kmFin !== undefined && `→ ${item.kmFin} km`}</p></div><div className="item-actions"><span className="status">{label(item.statut)}</span>{canManageFleet && item.statut === 'en_cours' && <><button className="link-button" onClick={() => { setEditingAssignment(item); setAssignmentForm({ vehicule: item.vehicule?._id || '', conducteur: item.conducteur?._id || '', dateDebut: item.dateDebut?.slice(0, 10) || '', kmDebut: item.kmDebut, observations: item.observations || '' }); }}>Modifier</button><button className="link-button" onClick={() => finishAssignment(item)}>Terminer</button></>}</div></article>)}</div> : <p className="empty-state">Aucune affectation enregistrée.</p>}</section>; }
function AssignmentForm({ form, setForm, vehicles, users, submit, editing, cancel }) { return <form className="form-panel" onSubmit={submit}><div className="form-heading"><h3>{editing ? 'Modifier l’affectation' : 'Nouvelle affectation'}</h3>{editing && <button type="button" className="link-button" onClick={cancel}>Annuler</button>}</div><div className="form-grid"><Field label="Véhicule"><select required value={form.vehicule} onChange={(e) => setForm({ ...form, vehicule: e.target.value })}><option value="">Choisir</option>{vehicles.filter((item) => item.statut === 'disponible' || item._id === form.vehicule).map((item) => <option key={item._id} value={item._id}>{item.immatriculation} · {item.modele}</option>)}</select></Field><Field label="Conducteur"><select required value={form.conducteur} onChange={(e) => setForm({ ...form, conducteur: e.target.value })}><option value="">Choisir</option>{users.filter((item) => item.role === 'conducteur' && item.actif).map((item) => <option key={item._id} value={item._id}>{item.prenom} {item.nom}</option>)}</select></Field><Field label="Date de début"><input type="date" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} /></Field><Field label="Kilométrage de départ"><input required min="0" type="number" value={form.kmDebut} onChange={(e) => setForm({ ...form, kmDebut: e.target.value })} /></Field><Field label="Observations"><textarea value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} /></Field></div><button className="btn-primary">{editing ? 'Enregistrer' : 'Créer l’affectation'}</button></form>; }

function ProfileSection({ user, profileForm, setProfileForm, onSubmit, onCancel }) {
  const [showPasswords, setShowPasswords] = useState(false);
  const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase() || '?';
  const update = (field, value) => setProfileForm({ ...profileForm, [field]: value });
  return <section className="workspace profile-section">
    <div className="section-header"><div><p className="eyebrow">Compte utilisateur</p><h2>Mon profil</h2></div></div>
    <div className="profile-identity"><div className="profile-avatar" aria-hidden="true">{initials}</div><div><strong>{[user?.prenom, user?.nom].filter(Boolean).join(' ')}</strong><small>{libellesRoles[user?.role] || user?.role || 'Rôle non renseigné'}</small></div></div>
    <form onSubmit={onSubmit}>
      <div className="form-heading"><h3>Informations personnelles</h3></div>
      <div className="form-grid"><Field label="Prénom"><input required value={profileForm.prenom} onChange={(e) => update('prenom', e.target.value)} /></Field><Field label="Nom"><input required value={profileForm.nom} onChange={(e) => update('nom', e.target.value)} /></Field><Field label="Adresse e-mail"><input required type="email" value={profileForm.email} onChange={(e) => update('email', e.target.value)} /></Field><Field label="Téléphone (facultatif)"><input type="tel" value={profileForm.telephone} onChange={(e) => update('telephone', e.target.value)} /></Field><Field label="Fonction dans l’entreprise"><input value={libellesRoles[user?.role] || user?.role || 'Non renseignée'} readOnly /></Field><Field label="Rôle"><input value={libellesRoles[user?.role] || user?.role || 'Non renseigné'} readOnly /></Field></div>
      <div className="form-heading"><h3>Modifier le mot de passe</h3><small>Laissez ces champs vides pour conserver votre mot de passe actuel.</small></div>
      <div className="form-grid"><Field label="Mot de passe actuel"><input type={showPasswords ? 'text' : 'password'} autoComplete="current-password" value={profileForm.motDePasseActuel} onChange={(e) => update('motDePasseActuel', e.target.value)} /></Field><Field label="Nouveau mot de passe"><input type={showPasswords ? 'text' : 'password'} autoComplete="new-password" value={profileForm.nouveauMotDePasse} onChange={(e) => update('nouveauMotDePasse', e.target.value)} /></Field><Field label="Confirmation du nouveau mot de passe"><input type={showPasswords ? 'text' : 'password'} autoComplete="new-password" value={profileForm.confirmationMotDePasse} onChange={(e) => update('confirmationMotDePasse', e.target.value)} /></Field></div>
      <label className="auth-remember"><input type="checkbox" checked={showPasswords} onChange={(e) => setShowPasswords(e.target.checked)} /> Afficher les mots de passe</label>
      <div className="item-actions profile-actions"><button className="btn-primary">Enregistrer les modifications</button><button type="button" className="btn-secondary" onClick={onCancel}>Annuler</button></div>
    </form>
  </section>;
}

function NotificationsSection({ form, setForm, onSubmit, onCancel }) {
  const preferences = [
    ['application', 'Notifications dans l’application', 'Afficher les alertes et rappels dans CarLog Pro.'],
    ['email', 'Notifications par e-mail', 'Autoriser l’envoi des notifications à votre adresse e-mail.'],
    ['entretienAvenir', 'Rappel d’entretien à venir', 'Être prévenu avant un entretien planifié.'],
    ['entretienRetard', 'Rappel d’entretien en retard', 'Être prévenu lorsqu’un entretien n’a pas été réalisé à temps.'],
    ['documentExpiration', 'Alerte document arrivant à expiration', 'Surveiller les documents proches de leur échéance.'],
    ['contratEcheance', 'Alerte contrat arrivant à échéance', 'Surveiller les contrats proches de leur échéance.'],
    ['carburantInhabituel', 'Alerte carburant / consommation inhabituelle', 'Signaler une consommation supérieure au seuil défini.'],
    ['resumeHebdomadaire', 'Résumé hebdomadaire de la flotte', 'Recevoir un bilan synthétique chaque semaine.'],
    ['resumeMensuel', 'Résumé mensuel des coûts', 'Recevoir un bilan mensuel des dépenses et coûts.']
  ];
  return <section className="workspace notification-settings">
    <div className="section-header"><div><p className="eyebrow">Compte utilisateur</p><h2>Préférences de notification</h2></div></div>
    <form onSubmit={onSubmit}>
      <p className="section-intro">Choisissez les informations que vous souhaitez recevoir. Les e-mails sont désactivés par défaut.</p>
      <div className="notification-options">
        {preferences.map(([key, title, description]) => <label className="notification-option" key={key}>
          <span><strong>{title}</strong><small>{description}</small></span>
          <input type="checkbox" checked={Boolean(form[key])} onChange={(event) => setForm({ ...form, [key]: event.target.checked })} />
        </label>)}
      </div>
      <div className="item-actions profile-actions"><button className="btn-primary">Enregistrer les préférences</button><button type="button" className="btn-secondary" onClick={onCancel}>Annuler</button></div>
    </form>
  </section>;
}

function EntrepriseSettingsSection({ form, setForm, onSubmit, onCancel }) {
  const valeurs = form || entrepriseInitial;
  const update = (field, value) => setForm({ ...valeurs, [field]: value });
  const adresse = valeurs.adresse || entrepriseInitial.adresse;
  const updateAddress = (field, value) => setForm({ ...valeurs, adresse: { ...adresse, [field]: value } });
  return <section className="workspace profile-section">
    <div className="section-header"><div><p className="eyebrow">Configuration du compte entreprise</p><h2>Paramètres de l’entreprise</h2></div></div>
    <form onSubmit={onSubmit}>
      <div className="form-heading"><h3>Informations de l’entreprise</h3><small>Le SIRET reste une donnée fictive pour le portfolio.</small></div>
      <div className="form-grid"><Field label="Nom de l’entreprise"><input required value={valeurs.nom || ''} onChange={(e) => update('nom', e.target.value)} /></Field><Field label="Logo (URL HTTPS)"><input type="url" value={valeurs.logoUrl || ''} onChange={(e) => update('logoUrl', e.target.value)} /></Field><Field label="Secteur d’activité (facultatif)"><input value={valeurs.secteurActivite || ''} onChange={(e) => update('secteurActivite', e.target.value)} /></Field><Field label="Taille de la flotte"><input min="0" type="number" value={valeurs.tailleFlotte ?? 0} onChange={(e) => update('tailleFlotte', e.target.value)} /></Field><Field label="SIRET fictif"><input value={valeurs.siret || ''} readOnly /></Field><Field label="E-mail de contact"><input required type="email" value={valeurs.emailProfessionnel || ''} onChange={(e) => update('emailProfessionnel', e.target.value)} /></Field><Field label="Téléphone de contact"><input required value={valeurs.telephone || ''} onChange={(e) => update('telephone', e.target.value)} /></Field></div>
      <div className="form-heading"><h3>Adresse de l’entreprise</h3></div>
      <div className="form-grid"><Field label="Rue"><input required value={adresse.rue || ''} onChange={(e) => updateAddress('rue', e.target.value)} /></Field><Field label="Code postal"><input required pattern="[0-9]{5}" value={adresse.codePostal || ''} onChange={(e) => updateAddress('codePostal', e.target.value)} /></Field><Field label="Ville"><input required value={adresse.ville || ''} onChange={(e) => updateAddress('ville', e.target.value)} /></Field><Field label="Pays"><input required value={adresse.pays || 'France'} onChange={(e) => updateAddress('pays', e.target.value)} /></Field></div>
      <div className="form-heading"><h3>Préférences régionales et alertes</h3></div>
      <div className="form-grid"><Field label="Devise"><select value={valeurs.devise || 'EUR'} onChange={(e) => update('devise', e.target.value)}><option value="EUR">Euro (€)</option><option value="USD">Dollar ($)</option><option value="GBP">Livre (£)</option></select></Field><Field label="Fuseau horaire"><input value={valeurs.fuseauHoraire || 'Europe/Paris'} onChange={(e) => update('fuseauHoraire', e.target.value)} /></Field><Field label="Format de date"><select value={valeurs.formatDate || 'DD/MM/YYYY'} onChange={(e) => update('formatDate', e.target.value)}><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select></Field><Field label="Distances"><select value={valeurs.uniteDistance || 'kilometres'} onChange={(e) => update('uniteDistance', e.target.value)}><option value="kilometres">Kilomètres</option><option value="miles">Miles</option></select></Field><Field label="Carburant"><select value={valeurs.uniteCarburant || 'litres'} onChange={(e) => update('uniteCarburant', e.target.value)}><option value="litres">Litres</option><option value="gallons">Gallons</option></select></Field><Field label="Seuil consommation inhabituelle"><input min="0" step="0.1" type="number" value={valeurs.seuilConsommationInhabituelle ?? 12} onChange={(e) => update('seuilConsommationInhabituelle', e.target.value)} /></Field><Field label="Alerte document avant expiration (jours)"><input min="0" max="365" type="number" value={valeurs.delaiAlerteDocument ?? 30} onChange={(e) => update('delaiAlerteDocument', e.target.value)} /></Field><Field label="Alerte contrat avant échéance (jours)"><input min="0" max="365" type="number" value={valeurs.delaiAlerteContrat ?? 30} onChange={(e) => update('delaiAlerteContrat', e.target.value)} /></Field></div>
      <div className="item-actions profile-actions"><button className="btn-primary">Enregistrer les paramètres</button><button type="button" className="btn-secondary" onClick={onCancel}>Annuler</button></div>
    </form>
  </section>;
}

function UserSection({ users, user, userForm, setUserForm, saveUser, disableUser, reactivateUser, editingUser, setEditingUser, readOnly }) {
  return <section className="workspace">
    <div className="section-header"><div><p className="eyebrow">Équipe entreprise</p><h2>Utilisateurs</h2></div></div>
    {!readOnly && <form className="form-panel" autoComplete="off" onSubmit={saveUser}>
      <div className="form-heading"><h3>{editingUser ? 'Modifier un utilisateur' : 'Créer un utilisateur'}</h3><small>{editingUser ? 'Le mot de passe ne peut pas être modifié ici.' : 'Le mot de passe initial est hashé par le backend et jamais renvoyé.'}</small>{editingUser && <button type="button" className="link-button" onClick={() => { setEditingUser(null); setUserForm(userInitial); }}>Annuler</button>}</div>
      <div className="form-grid"><Field label="Nom"><input required value={userForm.nom} onChange={(e) => setUserForm({ ...userForm, nom: e.target.value })} /></Field><Field label="Prénom"><input required value={userForm.prenom} onChange={(e) => setUserForm({ ...userForm, prenom: e.target.value })} /></Field><Field label="Email"><input required type="email" autoComplete="off" name="nouvel-utilisateur-email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></Field><Field label="Téléphone"><input value={userForm.telephone} onChange={(e) => setUserForm({ ...userForm, telephone: e.target.value })} /></Field><Field label="Rôle"><select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>{roles.map((item) => <option key={item} value={item}>{libellesRoles[item]}</option>)}</select></Field>{!editingUser && <Field label="Mot de passe initial"><input required minLength="8" type="password" autoComplete="new-password" name="nouvel-utilisateur-mot-de-passe" value={userForm.motDePasse} onChange={(e) => setUserForm({ ...userForm, motDePasse: e.target.value })} /></Field>}</div>
      <button className="btn-primary">{editingUser ? 'Enregistrer les modifications' : 'Créer l’utilisateur'}</button>
    </form>}
    <div className="table-wrap"><table><thead><tr><th>Utilisateur</th><th>Rôle</th><th>État</th><th>Action</th></tr></thead><tbody>{users.map((item) => <tr key={item._id}><td><strong>{item.prenom} {item.nom}</strong><small>{item.email}</small></td><td>{libellesRoles[item.role] || item.role}</td><td>{item.actif ? 'Actif' : 'Désactivé'}</td><td>{!readOnly && item._id !== user?.id && <>{item.actif ? <button className="link-button" onClick={() => { setEditingUser(item); setUserForm({ ...userInitial, ...item, motDePasse: '' }); }}>Modifier</button> : <button className="link-button" onClick={() => reactivateUser(item._id)}>Réactiver</button>}{item.actif && item.role !== 'admin' && <button className="link-button danger" onClick={() => disableUser(item._id)}>Désactiver</button>}</>}</td></tr>)}</tbody></table></div>
  </section>;
}
function Pagination({ data, change }) { return data.totalPages > 1 && <div className="pagination"><button disabled={data.currentPage <= 1} onClick={() => change(data.currentPage - 1)}>Précédent</button><span>Page {data.currentPage} sur {data.totalPages}</span><button disabled={data.currentPage >= data.totalPages} onClick={() => change(data.currentPage + 1)}>Suivant</button></div>; }

function DocumentSection({ documents, documentFilters, setDocumentFilters, documentForm, setDocumentForm, documentFile, setDocumentFile, saveDocument, downloadDocument, previewDocument, archiveDocument, deleteDocument, loadData, vehicles, canManageDocuments, canDeleteDocuments }) {
  const statutLabel = { actif: 'Actif', a_renouveler: 'À renouveler', urgent: 'Urgent', expire: 'Expiré', archive: 'Archivé' };
  return <section className="workspace">
    <div className="section-header"><div><p className="eyebrow">Conformité et contrats</p><h2>Documents & contrats <span className="count-badge">{documents.length}</span></h2></div></div>
    <div className="toolbar"><select value={documentFilters.vehicule} onChange={(e) => setDocumentFilters({ ...documentFilters, vehicule: e.target.value })}><option value="">Tous les véhicules</option>{vehicles.map((item) => <option key={item._id} value={item._id}>{item.immatriculation}</option>)}</select><select value={documentFilters.typeDocument} onChange={(e) => setDocumentFilters({ ...documentFilters, typeDocument: e.target.value })}><option value="">Tous les types</option>{typesDocument.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select><select value={documentFilters.statut} onChange={(e) => setDocumentFilters({ ...documentFilters, statut: e.target.value })}><option value="">Tous les statuts</option>{statutsDocument.map((item) => <option key={item} value={item}>{statutLabel[item]}</option>)}</select><button className="btn-primary" onClick={() => loadData()}>Actualiser</button></div>
    {canManageDocuments && <form className="form-panel" onSubmit={saveDocument}><div className="form-heading"><h3>Ajouter un document</h3><small>PDF, image ou fichier texte · 10 Mo maximum.</small></div><div className="form-grid"><Field label="Fichier"><input required type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.txt" onChange={(e) => setDocumentFile(e.target.files[0] || null)} /></Field><Field label="Véhicule"><select required value={documentForm.vehicule} onChange={(e) => setDocumentForm({ ...documentForm, vehicule: e.target.value })}><option value="">Sélectionner</option>{vehicles.map((item) => <option key={item._id} value={item._id}>{item.immatriculation} · {item.marque} {item.modele}</option>)}</select></Field><Field label="Type"><select value={documentForm.typeDocument} onChange={(e) => setDocumentForm({ ...documentForm, typeDocument: e.target.value })}>{typesDocument.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></Field><Field label="Référence / contrat"><input maxLength="200" value={documentForm.reference} onChange={(e) => setDocumentForm({ ...documentForm, reference: e.target.value })} /></Field><Field label="Compagnie / prestataire"><input maxLength="200" value={documentForm.prestataire} onChange={(e) => setDocumentForm({ ...documentForm, prestataire: e.target.value })} /></Field><Field label="Date de début"><input required type="date" value={documentForm.dateDebut} onChange={(e) => setDocumentForm({ ...documentForm, dateDebut: e.target.value })} /></Field><Field label="Date d’échéance"><input required type="date" value={documentForm.dateEcheance} onChange={(e) => setDocumentForm({ ...documentForm, dateEcheance: e.target.value })} /></Field><Field label="Coût (€)"><input min="0" step="0.01" type="number" value={documentForm.cout} onChange={(e) => setDocumentForm({ ...documentForm, cout: e.target.value })} /></Field></div><button className="btn-primary">Ajouter le document</button></form>}
    {documents.length ? <div className="table-wrap"><table><thead><tr><th>Document</th><th>Véhicule</th><th>Échéance</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{documents.map((item) => <tr key={item._id}><td><strong>{item.nomOriginal}</strong><small>{label(item.typeDocument)}{item.reference ? ` · ${item.reference}` : ''}</small></td><td>{item.vehicule?.immatriculation || '—'}</td><td>{new Date(item.dateEcheance).toLocaleDateString('fr-FR')}</td><td><span className={`status ${item.statut === 'expire' || item.statut === 'urgent' ? 'danger' : ''}`}>{statutLabel[item.statut] || item.statut}</span></td><td><button className="link-button" onClick={() => previewDocument(item)}>Consulter</button><button className="link-button" onClick={() => downloadDocument(item)}>Télécharger</button>{canManageDocuments && item.statut !== 'archive' && <button className="link-button" onClick={() => archiveDocument(item)}>Archiver</button>}{canDeleteDocuments && <button className="link-button danger" onClick={() => deleteDocument(item._id)}>Supprimer</button>}</td></tr>)}</tbody></table></div> : <p className="empty-state">Aucun document pour ces critères.</p>}
  </section>;
}

function CoutsSection({ depenses, coutsOverview, carburantOverview, coutsFilters, setCoutsFilters, loadData, depenseForm, setDepenseForm, editingDepense, setEditingDepense, saveDepense, editDepense, deleteDepense, exportDepensesCsv, vehicles, canManageCosts, canDeleteCosts }) {
  const [sousOnglet, setSousOnglet] = useState('overview');
  const total = coutsOverview?.total || 0;
  const precedent = coutsOverview?.precedentTotal || 0;
  const variation = precedent ? ((total - precedent) / precedent) * 100 : null;
  const maxCategorie = Math.max(...(coutsOverview?.parCategorie || []).map((item) => item.total), 1);
  const maxMois = Math.max(...(coutsOverview?.parMois || []).map((item) => item.total), 1);
  const pleins = carburantOverview?.pleins || depenses.filter((item) => item.categorie === 'carburant');
  return <section className="workspace">
    <div className="section-header"><div><p className="eyebrow">Pilotage financier</p><h2>Coûts</h2></div><div className="item-actions"><button className="btn-secondary" onClick={exportDepensesCsv}>Exporter en CSV</button></div></div>
    <nav className="tabs"><button className={sousOnglet === 'overview' ? 'tab active' : 'tab'} onClick={() => setSousOnglet('overview')}>Vue d’ensemble</button><button className={sousOnglet === 'carburant' ? 'tab active' : 'tab'} onClick={() => setSousOnglet('carburant')}>Carburant</button></nav>
    {sousOnglet === 'overview' ? <><div className="toolbar"><Field label="Du"><input type="date" value={coutsFilters.debut} onChange={(e) => setCoutsFilters({ ...coutsFilters, debut: e.target.value })} /></Field><Field label="Au"><input type="date" value={coutsFilters.fin} onChange={(e) => setCoutsFilters({ ...coutsFilters, fin: e.target.value })} /></Field><select value={coutsFilters.vehicule} onChange={(e) => setCoutsFilters({ ...coutsFilters, vehicule: e.target.value })}><option value="">Tous les véhicules</option>{vehicles.map((item) => <option key={item._id} value={item._id}>{item.immatriculation}</option>)}</select><select value={coutsFilters.categorie} onChange={(e) => setCoutsFilters({ ...coutsFilters, categorie: e.target.value })}><option value="">Toutes les catégories</option>{categoriesDepense.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select><button className="btn-primary" onClick={() => loadData()}>Appliquer</button></div>
    <div className="kpi-grid"><Kpi title="Coût total" value={`${total.toFixed(2)} €`} /><Kpi title="Moyenne par véhicule" value={`${(coutsOverview?.moyenneParVehicule || 0).toFixed(2)} €`} /><Kpi title="Coût par kilomètre" value={`${(coutsOverview?.coutParKilometre || 0).toFixed(2)} €`} /><Kpi title="Comparaison mois précédent" value={variation === null ? '—' : `${variation >= 0 ? '+' : ''}${variation.toFixed(1)} %`} /></div>
    <div className="dashboard-grid"><section className="card-section"><div className="section-header"><h3>Répartition des dépenses</h3></div>{(coutsOverview?.parCategorie || []).map((item) => <div className="stat-row" key={item._id}><span>{label(item._id)}</span><strong>{item.total.toFixed(2)} €</strong><div className="bar"><i style={{ width: `${item.total / maxCategorie * 100}%` }} /></div></div>)}{!coutsOverview?.parCategorie?.length && <p className="empty-state">Aucune dépense sur cette période.</p>}</section><section className="card-section"><div className="section-header"><h3>Évolution mensuelle</h3></div>{(coutsOverview?.parMois || []).map((item) => <div className="stat-row" key={item._id}><span>{item._id}</span><strong>{item.total.toFixed(2)} €</strong><div className="bar"><i style={{ width: `${item.total / maxMois * 100}%` }} /></div></div>)}{!coutsOverview?.parMois?.length && <p className="empty-state">Aucune donnée mensuelle.</p>}</section></div>
    <section className="card-section"><div className="section-header"><h3>TCO par véhicule</h3><small>Coût total de possession sur la période sélectionnée</small></div>{coutsOverview?.parVehicule?.length ? <div className="table-wrap"><table><thead><tr><th>Véhicule</th><th>TCO</th><th>Distance connue</th><th>Coût/km</th></tr></thead><tbody>{coutsOverview.parVehicule.map((item) => { const distance = Number.isFinite(item.minimumKm) && Number.isFinite(item.maximumKm) ? Math.max(item.maximumKm - item.minimumKm, 0) : 0; const vehicle = vehicles.find((entry) => String(entry._id) === String(item._id)); return <tr key={item._id}><td>{vehicle?.immatriculation || 'Véhicule indisponible'}</td><td>{item.total.toFixed(2)} €</td><td>{distance ? `${distance} km` : '—'}</td><td>{distance ? `${(item.total / distance).toFixed(2)} €` : '—'}</td></tr>; })}</tbody></table></div> : <p className="empty-state">Aucun TCO calculable pour cette période.</p>}</section>
    {canManageCosts && <form className="form-panel" onSubmit={saveDepense}><div className="form-heading"><h3>{depenseForm.categorie === 'carburant' ? 'Enregistrer un plein' : 'Ajouter une dépense'}</h3><small>Les pleins sont enregistrés dans la catégorie carburant.</small></div><div className="form-grid"><Field label="Véhicule"><select required value={depenseForm.vehicule} onChange={(e) => setDepenseForm({ ...depenseForm, vehicule: e.target.value })}><option value="">Sélectionner</option>{vehicles.map((item) => <option key={item._id} value={item._id}>{item.immatriculation} · {item.marque} {item.modele}</option>)}</select></Field><Field label="Catégorie"><select value={depenseForm.categorie} onChange={(e) => setDepenseForm({ ...depenseForm, categorie: e.target.value })}>{categoriesDepense.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></Field><Field label="Date"><input required type="date" value={depenseForm.dateDepense} onChange={(e) => setDepenseForm({ ...depenseForm, dateDepense: e.target.value })} /></Field><Field label="Montant (€)"><input required min="0" step="0.01" type="number" value={depenseForm.montant} onChange={(e) => setDepenseForm({ ...depenseForm, montant: e.target.value })} /></Field><Field label="Kilométrage"><input min="0" type="number" value={depenseForm.kilometrage} onChange={(e) => setDepenseForm({ ...depenseForm, kilometrage: e.target.value })} /></Field>{depenseForm.categorie === 'carburant' && <><Field label="Litres"><input min="0" step="0.01" type="number" value={depenseForm.litres} onChange={(e) => setDepenseForm({ ...depenseForm, litres: e.target.value })} /></Field><Field label="Prix au litre (€)"><input min="0" step="0.001" type="number" value={depenseForm.prixAuLitre} onChange={(e) => setDepenseForm({ ...depenseForm, prixAuLitre: e.target.value })} /></Field></>}<Field label="Description"><textarea maxLength="2000" value={depenseForm.description} onChange={(e) => setDepenseForm({ ...depenseForm, description: e.target.value })} /></Field></div><button className="btn-primary">Enregistrer la dépense</button></form>}
    <div className="section-header"><div><h3>Historique des dépenses</h3><small>{depenses.length} dépense(s) chargée(s)</small></div></div>{depenses.length ? <div className="table-wrap"><table><thead><tr><th>Date</th><th>Véhicule</th><th>Catégorie</th><th>Montant</th><th>Km</th><th>Actions</th></tr></thead><tbody>{depenses.map((item) => <tr key={item._id}><td>{new Date(item.dateDepense).toLocaleDateString('fr-FR')}</td><td>{item.vehicule?.immatriculation || '—'}</td><td>{label(item.categorie)}</td><td>{Number(item.montant).toFixed(2)} €</td><td>{item.kilometrage ?? '—'}</td><td>{canManageCosts && <button className="link-button" onClick={() => editDepense(item)}>Modifier</button>}{canDeleteCosts && <button className="link-button danger" onClick={() => deleteDepense(item._id)}>Supprimer</button>}</td></tr>)}</tbody></table></div> : <p className="empty-state">Aucune dépense enregistrée.</p>}</> : <>
    <div className="toolbar"><Field label="Du"><input type="date" value={coutsFilters.debut} onChange={(e) => setCoutsFilters({ ...coutsFilters, debut: e.target.value })} /></Field><Field label="Au"><input type="date" value={coutsFilters.fin} onChange={(e) => setCoutsFilters({ ...coutsFilters, fin: e.target.value })} /></Field><button className="btn-primary" onClick={() => loadData()}>Appliquer</button></div>
    <div className="kpi-grid"><Kpi title="Pleins enregistrés" value={pleins.length} /><Kpi title="Litres consommés" value={`${pleins.reduce((sum, item) => sum + (Number(item.litres) || 0), 0).toFixed(2)} L`} /><Kpi title="Alertes consommation" value={pleins.filter((item) => item.consommationInhabituelle).length} /><Kpi title="Seuil d’alerte" value={`${carburantOverview?.seuilAlerte || 12} L/100 km`} /></div>
    {canManageCosts && <form className="form-panel" onSubmit={saveDepense}><div className="form-heading"><h3>{editingDepense ? 'Modifier le plein' : 'Enregistrer un plein'}</h3>{editingDepense && <button type="button" className="link-button" onClick={() => { setEditingDepense(null); setDepenseForm(depenseInitial); }}>Annuler</button>}</div><div className="form-grid"><Field label="Véhicule"><select required value={depenseForm.vehicule} onChange={(e) => setDepenseForm({ ...depenseForm, vehicule: e.target.value })}><option value="">Sélectionner</option>{vehicles.map((item) => <option key={item._id} value={item._id}>{item.immatriculation} · {item.marque} {item.modele}</option>)}</select></Field><Field label="Date"><input required type="date" value={depenseForm.dateDepense} onChange={(e) => setDepenseForm({ ...depenseForm, dateDepense: e.target.value, categorie: 'carburant' })} /></Field><Field label="Kilométrage"><input required min="0" type="number" value={depenseForm.kilometrage} onChange={(e) => setDepenseForm({ ...depenseForm, kilometrage: e.target.value, categorie: 'carburant' })} /></Field><Field label="Litres"><input required min="0" step="0.01" type="number" value={depenseForm.litres} onChange={(e) => setDepenseForm({ ...depenseForm, litres: e.target.value, categorie: 'carburant' })} /></Field><Field label="Prix au litre (€)"><input required min="0" step="0.001" type="number" value={depenseForm.prixAuLitre} onChange={(e) => setDepenseForm({ ...depenseForm, prixAuLitre: e.target.value, categorie: 'carburant' })} /></Field><Field label="Montant total (€)"><input required min="0" step="0.01" type="number" value={depenseForm.montant} onChange={(e) => setDepenseForm({ ...depenseForm, montant: e.target.value, categorie: 'carburant' })} /></Field><Field label="Station-service"><input maxLength="200" value={depenseForm.stationService || ''} onChange={(e) => setDepenseForm({ ...depenseForm, stationService: e.target.value, categorie: 'carburant' })} /></Field><Field label="Type de carburant"><select required value={depenseForm.typeCarburant || 'diesel'} onChange={(e) => setDepenseForm({ ...depenseForm, typeCarburant: e.target.value, categorie: 'carburant' })}>{carburants.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></Field></div><button className="btn-primary">{editingDepense ? 'Enregistrer les modifications' : 'Enregistrer le plein'}</button></form>}
    {pleins.length ? <div className="table-wrap"><table><thead><tr><th>Date</th><th>Véhicule</th><th>Km</th><th>Litres</th><th>Prix/L</th><th>Montant</th><th>Consommation</th><th>Actions</th></tr></thead><tbody>{pleins.map((item) => <tr key={item._id}><td>{new Date(item.dateDepense).toLocaleDateString('fr-FR')}</td><td>{item.vehicule?.immatriculation || '—'}</td><td>{item.kilometrage ?? '—'}</td><td>{item.litres ?? '—'}</td><td>{item.prixAuLitre ?? '—'} €</td><td>{Number(item.montant).toFixed(2)} €</td><td>{item.consommationMoyenne === null || item.consommationMoyenne === undefined ? '—' : <span className={item.consommationInhabituelle ? 'status error' : 'status'}>{item.consommationMoyenne.toFixed(2)} L/100 km{item.consommationInhabituelle ? ' ⚠️' : ''}</span>}</td><td>{canManageCosts && <button className="link-button" onClick={() => editDepense(item)}>Modifier</button>}{canDeleteCosts && <button className="link-button danger" onClick={() => deleteDepense(item._id)}>Supprimer</button>}</td></tr>)}</tbody></table></div> : <p className="empty-state">Aucun plein enregistré.</p>}
    {carburantOverview?.parVehicule?.length > 0 && <section className="card-section"><div className="section-header"><h3>Consommation moyenne par véhicule</h3></div><div className="table-wrap"><table><thead><tr><th>Véhicule</th><th>L/100 km</th><th>Coût carburant/km</th></tr></thead><tbody>{carburantOverview.parVehicule.map((item) => <tr key={item.vehicule}><td>{item.libelle}</td><td>{item.consommationMoyenne == null ? '—' : `${item.consommationMoyenne.toFixed(2)} L/100 km`}</td><td>{item.coutParKilometre == null ? '—' : `${item.coutParKilometre.toFixed(2)} €`}</td></tr>)}</tbody></table></div></section>}
    </>}
  </section>;
}
