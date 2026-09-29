import { useEffect, useState } from 'react';
import { api, messageErreurApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const typesVehicule = ['porteur', 'tracteur', 'remorque', 'utilitaire', 'voiture'];
const carburants = ['diesel', 'gnv', 'electrique', 'hydrogene', 'essence', 'hybride'];
const statutsVehicule = ['disponible', 'en_course', 'en_maintenance', 'en_panne'];
const typesAlerte = ['maintenance', 'carburant', 'securite', 'geo-fencing', 'administratif'];
const urgences = ['low', 'medium', 'critical'];
const statutsAlerte = ['active', 'en_cours', 'resolue', 'acquittee'];
const roles = ['admin', 'fleet_manager', 'conducteur', 'mecanicien', 'comptable'];
const libellesRoles = { admin: 'Administrateur', fleet_manager: 'Gestionnaire de flotte', conducteur: 'Conducteur', mecanicien: 'Mécanicien', comptable: 'Comptable' };

const vehicleInitial = { immatriculation: '', marque: '', modele: '', typeVehicule: 'utilitaire', annee: '', ptac: '', carburant: 'diesel', kilometrage: 0, statut: 'disponible' };
const alertInitial = { titre: '', description: '', typeAlerte: 'maintenance', niveauUrgence: 'medium', vehicule: '', conducteur: '' };
const assignmentInitial = { vehicule: '', conducteur: '', dateDebut: '', kmDebut: 0, observations: '' };
const userInitial = { nom: '', prenom: '', email: '', telephone: '', motDePasse: '', role: 'conducteur' };

function asList(response) {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  return data?.data || data?.alertes || data?.affectations || [];
}
function label(value) { return String(value || '').replaceAll('_', ' '); }

export default function Dashboard({ themeToggle }) {
  const { token, logout, user, login } = useAuth();
  const [tab, setTab] = useState('accueil');
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [assignments, setAssignments] = useState([]);
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
  const [alertFilters, setAlertFilters] = useState({ statut: '', niveauUrgence: '' });

  const isAdmin = user?.role === 'admin';
  const readOnly = user?.abonnement === 'past_due';
  const canceled = user?.abonnement === 'canceled';
  const canManageFleet = !readOnly && ['admin', 'fleet_manager'].includes(user?.role);
  const canViewUsers = ['admin', 'fleet_manager'].includes(user?.role);
  const canModifyAlerts = !readOnly && ['admin', 'fleet_manager', 'mecanicien'].includes(user?.role);

  async function loadData(params = {}) {
    setLoading(true);
    setError('');
    const results = await Promise.allSettled([
      api.getVehicules({ page: 1, limit: 10, ...vehicleFilters, ...params }),
      api.getAlertes(),
      api.getAffectations(),
      api.getStats(),
      canViewUsers ? api.getUtilisateurs() : Promise.resolve(null),
    ]);
    if (results.some((item) => item.status === 'rejected' && item.reason?.response?.status === 401)) {
      logout();
      setError('Votre session a expiré. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }
    const [vehicleResult, alertResult, assignmentResult, statsResult, userResult] = results;
    if (vehicleResult.status === 'fulfilled') {
      setVehicles(vehicleResult.value.data?.data || []);
      setPagination(vehicleResult.value.data?.pagination || pagination);
    }
    if (alertResult.status === 'fulfilled') setAlerts(asList(alertResult.value));
    if (assignmentResult.status === 'fulfilled') setAssignments(asList(assignmentResult.value));
    if (statsResult.status === 'fulfilled') setStats(statsResult.value.data);
    if (userResult?.status === 'fulfilled') setUsers(asList(userResult.value));
    const blockingError = [vehicleResult, alertResult, assignmentResult].find((item) => item.status === 'rejected');
    if (blockingError) setError(messageErreurApi(blockingError.reason));
    setLoading(false);
  }

  useEffect(() => { if (!canceled) loadData(); }, [token, canManageFleet, canceled]);
  useEffect(() => {
    if (canceled && isAdmin) api.getEntreprise().then((response) => setEntrepriseInfo(response.data)).catch(() => {});
  }, [canceled, isAdmin]);

  async function refreshSubscription() {
    try {
      const response = await api.getProfil();
      login(response.data, token);
    } catch (exception) { handleError(exception); }
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
      const data = { ...vehicleForm, annee: vehicleForm.annee ? Number(vehicleForm.annee) : undefined, ptac: vehicleForm.ptac === '' ? '' : Number(vehicleForm.ptac), kilometrage: Number(vehicleForm.kilometrage) };
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

  if (canceled) return <div>
    <header className="navbar"><div className="logo">CarLog <span>Pro</span></div><div className="user-menu"><span>Bonjour, <strong>{user?.prenom || 'utilisateur'}</strong></span>{themeToggle}<button className="btn-logout" onClick={logout}>Déconnexion</button></div></header>
    <main className="dashboard-container">
      <div className="page-heading"><div><p className="eyebrow">Gestion du compte</p><h1 className="dashboard-title">Abonnement suspendu</h1></div><button className="btn-secondary" onClick={refreshSubscription}>Actualiser le statut</button></div>
      <div className="notice error" role="status">L’abonnement de votre entreprise est résilié. L’accès aux données de la flotte est suspendu.</div>
      {isAdmin && <section className="workspace"><h2>{entrepriseInfo?.nom || 'Compte entreprise'}</h2><p>Statut : {entrepriseInfo?.statutAbonnement || 'résilié'} · Formule : {entrepriseInfo?.formuleAbonnement || 'non renseignée'}</p><p>Pour réactiver l’accès, contactez l’assistance CarLog Pro. La réactivation est gérée manuellement pour le moment.</p></section>}
    </main>
  </div>;

  const filteredAlerts = alerts.filter((item) => (!alertFilters.statut || item.statut === alertFilters.statut) && (!alertFilters.niveauUrgence || item.niveauUrgence === alertFilters.niveauUrgence));
  const activeAssignments = assignments.filter((item) => item.statut === 'en_cours');
  if (loading && !vehicles.length && !alerts.length) return <div className="dashboard-container"><p className="empty-state">Chargement des données de votre entreprise...</p></div>;

  return <div>
    <header className="navbar"><div className="logo">CarLog <span>Pro</span></div><div className="user-menu"><span>Bonjour, <strong>{user?.prenom || 'utilisateur'}</strong></span>{themeToggle}<button className="btn-logout" onClick={logout}>Déconnexion</button></div></header>
    <main className="dashboard-container">
      <div className="page-heading"><div><p className="eyebrow">Gestion de flotte</p><h1 className="dashboard-title">Votre espace de pilotage</h1></div><button className="btn-secondary" onClick={() => loadData()}>Actualiser</button></div>
      {error && <div className="notice error">{error}</div>}{notice && <div className="notice success">{notice}<button onClick={() => setNotice('')} aria-label="Fermer">×</button></div>}
      {readOnly && <div className="notice error" role="status">L’abonnement de votre entreprise est en attente de régularisation. L’espace est en lecture seule, sauf pour le signalement d’une alerte.{isAdmin && ' La régularisation est gérée manuellement pour le moment ; contactez l’assistance CarLog Pro.'}<button className="btn-secondary" onClick={refreshSubscription}>Actualiser le statut</button></div>}
      <nav className="tabs">{[['accueil', 'Vue d’ensemble'], ['vehicules', 'Véhicules'], ['alertes', 'Alertes'], ['affectations', 'Affectations'], ...(isAdmin ? [['utilisateurs', 'Utilisateurs']] : [])].map(([id, text]) => <button className={tab === id ? 'tab active' : 'tab'} key={id} onClick={() => setTab(id)}>{text}</button>)}</nav>
      {tab === 'accueil' && <Home stats={stats} vehicles={vehicles} alerts={alerts} assignments={activeAssignments} openTab={setTab} />}
      {tab === 'vehicules' && <VehicleSection {...{ vehicleFilters, setVehicleFilters, pagination, loadData, canManageFleet, isAdmin: isAdmin && !readOnly, vehicles, vehicleForm, setVehicleForm, saveVehicle, editingVehicle, setEditingVehicle, archiveVehicle }} />}
      {tab === 'alertes' && <AlertSection {...{ alertFilters, setAlertFilters, filteredAlerts, alertForm, setAlertForm, vehicles, users, saveAlert, canModifyAlerts, isAdmin: isAdmin && !readOnly, changeAlert, deleteAlert }} />}
      {tab === 'affectations' && <AssignmentSection {...{ assignments, activeAssignments, canManageFleet, vehicles, users, assignmentForm, setAssignmentForm, saveAssignment, editingAssignment, setEditingAssignment, finishAssignment }} />}
      {tab === 'utilisateurs' && isAdmin && <UserSection {...{ users, user, userForm, setUserForm, saveUser, disableUser, reactivateUser, editingUser, setEditingUser, readOnly }} />}
    </main>
  </div>;
}

function Home({ stats, vehicles, alerts, assignments, openTab }) {
  const counts = stats?.vehicules || {};
  return <><div className="kpi-grid"><Kpi title="Véhicules actifs" value={counts.total ?? vehicles.length} /><Kpi title="Disponibles" value={counts.disponible ?? 0} /><Kpi title="Alertes actives" value={alerts.filter((item) => item.statut !== 'resolue').length} /><Kpi title="Affectations en cours" value={stats?.missions?.enCours ?? assignments.length} /></div><div className="dashboard-grid"><ListCard title="Véhicules récents" items={vehicles.slice(0, 5)} onOpen={() => openTab('vehicules')} /><ListCard title="Alertes récentes" items={alerts.slice(0, 5)} onOpen={() => openTab('alertes')} /></div><section className="card-section stats-section"><div className="section-header"><h2>Répartition de la flotte</h2>{!stats && <small>Statistiques non accessibles pour ce rôle.</small>}</div>{stats ? statutsVehicule.map((status) => <div className="stat-row" key={status}><span>{label(status)}</span><strong>{counts[status] || 0}</strong><div className="bar"><i style={{ width: `${counts.total ? (counts[status] || 0) / counts.total * 100 : 0}%` }} /></div></div>) : <p className="empty-state">Les statistiques globales sont réservées à l'équipe de gestion.</p>}</section></>;
}
function Kpi({ title, value }) { return <article className="kpi"><small>{title}</small><strong>{value}</strong></article>; }
function ListCard({ title, items, onOpen }) { return <section className="card-section"><div className="section-header"><h2>{title}</h2><button className="link-button" onClick={onOpen}>Voir tout</button></div>{items.map((item) => <div className="data-item" key={item._id}><div><strong>{item.marque ? `${item.marque} ${item.modele}` : item.titre}</strong><small>{item.immatriculation || `${item.typeAlerte} · ${item.niveauUrgence}`}</small></div><span className="status">{label(item.statut)}</span></div>)}{!items.length && <p className="empty-state">Aucune donnée pour le moment.</p>}</section>; }
function Field({ label: title, children }) { return <label className="field"><span>{title}</span>{children}</label>; }

function VehicleSection({ vehicleFilters, setVehicleFilters, pagination, loadData, canManageFleet, isAdmin, vehicles, vehicleForm, setVehicleForm, saveVehicle, editingVehicle, setEditingVehicle, archiveVehicle }) { return <section className="workspace"><div className="section-header"><div><p className="eyebrow">Parc automobile</p><h2>Véhicules <span className="count-badge">{pagination.totalItems}</span></h2></div></div><div className="toolbar"><input placeholder="Plaque, marque, modèle" value={vehicleFilters.search} onChange={(e) => setVehicleFilters({ ...vehicleFilters, search: e.target.value })} /><select value={vehicleFilters.typeVehicule} onChange={(e) => setVehicleFilters({ ...vehicleFilters, typeVehicule: e.target.value })}><option value="">Tous les types</option>{typesVehicule.map((item) => <option key={item}>{item}</option>)}</select><select value={vehicleFilters.statut} onChange={(e) => setVehicleFilters({ ...vehicleFilters, statut: e.target.value })}><option value="">Tous les statuts</option>{statutsVehicule.map((item) => <option key={item}>{item}</option>)}</select><button className="btn-primary" onClick={() => loadData()}>Rechercher</button></div>{canManageFleet && <VehicleForm form={vehicleForm} setForm={setVehicleForm} submit={saveVehicle} editing={editingVehicle} cancel={() => { setEditingVehicle(null); setVehicleForm(vehicleInitial); }} />}{vehicles.length ? <div className="table-wrap"><table><thead><tr><th>Véhicule</th><th>Type</th><th>Kilométrage</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{vehicles.map((item) => <tr key={item._id}><td><strong>{item.marque} {item.modele}</strong><small>{item.immatriculation} · {item.annee || 'année non renseignée'}</small></td><td>{item.typeVehicule}</td><td>{item.kilometrage} km</td><td><span className="status">{label(item.statut)}</span></td><td>{canManageFleet && <button className="link-button" onClick={() => { setEditingVehicle(item); setVehicleForm({ ...vehicleInitial, ...item }); }}>Modifier</button>}{isAdmin && <button className="link-button danger" onClick={() => archiveVehicle(item._id)}>Archiver</button>}</td></tr>)}</tbody></table></div> : <p className="empty-state">Aucun véhicule ne correspond à vos critères.</p>}<Pagination data={pagination} change={(page) => { setVehicleFilters({ ...vehicleFilters, page }); loadData({ page }); }} /></section>; }
function VehicleForm({ form, setForm, submit, editing, cancel }) { return <form className="form-panel" onSubmit={submit}><div className="form-heading"><h3>{editing ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h3>{editing && <button type="button" className="link-button" onClick={cancel}>Annuler</button>}</div><div className="form-grid"><Field label="Immatriculation"><input required value={form.immatriculation} onChange={(e) => setForm({ ...form, immatriculation: e.target.value })} /></Field><Field label="Marque"><input required value={form.marque} onChange={(e) => setForm({ ...form, marque: e.target.value })} /></Field><Field label="Modèle"><input required value={form.modele} onChange={(e) => setForm({ ...form, modele: e.target.value })} /></Field><Field label="Type"><select value={form.typeVehicule} onChange={(e) => setForm({ ...form, typeVehicule: e.target.value })}>{typesVehicule.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Année"><input type="number" value={form.annee} onChange={(e) => setForm({ ...form, annee: e.target.value })} /></Field><Field label="PTAC (kg)"><input required min="1" type="number" value={form.ptac} onChange={(e) => setForm({ ...form, ptac: e.target.value })} /></Field><Field label="Carburant"><select value={form.carburant} onChange={(e) => setForm({ ...form, carburant: e.target.value })}>{carburants.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Kilométrage"><input min="0" type="number" value={form.kilometrage} onChange={(e) => setForm({ ...form, kilometrage: e.target.value })} /></Field>{editing && <Field label="Statut"><select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>{statutsVehicule.map((item) => <option key={item}>{item}</option>)}</select></Field>}</div><button className="btn-primary">{editing ? 'Enregistrer' : 'Ajouter le véhicule'}</button></form>; }

function AlertSection({ alertFilters, setAlertFilters, filteredAlerts, alertForm, setAlertForm, vehicles, users, saveAlert, canModifyAlerts, isAdmin, changeAlert, deleteAlert }) { return <section className="workspace"><div className="section-header"><div><p className="eyebrow">Suivi des incidents</p><h2>Alertes <span className="count-badge">{filteredAlerts.length}</span></h2></div></div><div className="toolbar"><select value={alertFilters.statut} onChange={(e) => setAlertFilters({ ...alertFilters, statut: e.target.value })}><option value="">Tous les statuts</option>{statutsAlerte.map((item) => <option key={item}>{item}</option>)}</select><select value={alertFilters.niveauUrgence} onChange={(e) => setAlertFilters({ ...alertFilters, niveauUrgence: e.target.value })}><option value="">Toutes urgences</option>{urgences.map((item) => <option key={item}>{item}</option>)}</select></div><AlertForm form={alertForm} setForm={setAlertForm} vehicles={vehicles} users={users} submit={saveAlert} />{filteredAlerts.length ? <div className="data-list">{filteredAlerts.map((item) => <article className="data-item" key={item._id}><div><strong>{item.titre}</strong><small>{item.typeAlerte} · urgence {item.niveauUrgence}</small><p>{item.description || 'Aucune description.'}</p></div><div className="item-actions"><span className="status">{label(item.statut)}</span>{canModifyAlerts && item.statut !== 'resolue' && <button className="link-button" onClick={() => changeAlert(item._id, 'resolue')}>Résoudre</button>}{isAdmin && <button className="link-button danger" onClick={() => deleteAlert(item._id)}>Supprimer</button>}</div></article>)}</div> : <p className="empty-state">Aucune alerte pour ces critères.</p>}</section>; }
function AlertForm({ form, setForm, vehicles, users, submit }) { return <form className="form-panel" onSubmit={submit}><div className="form-heading"><h3>Signaler une alerte</h3></div><div className="form-grid"><Field label="Titre"><input required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} /></Field><Field label="Type"><select value={form.typeAlerte} onChange={(e) => setForm({ ...form, typeAlerte: e.target.value })}>{typesAlerte.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Urgence"><select value={form.niveauUrgence} onChange={(e) => setForm({ ...form, niveauUrgence: e.target.value })}>{urgences.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Véhicule"><select value={form.vehicule} onChange={(e) => setForm({ ...form, vehicule: e.target.value })}><option value="">Non précisé</option>{vehicles.map((item) => <option key={item._id} value={item._id}>{item.immatriculation} · {item.modele}</option>)}</select></Field><Field label="Conducteur"><select value={form.conducteur} onChange={(e) => setForm({ ...form, conducteur: e.target.value })}><option value="">Non précisé</option>{users.filter((item) => item.role === 'conducteur' && item.actif).map((item) => <option key={item._id} value={item._id}>{item.prenom} {item.nom}</option>)}</select></Field><Field label="Description"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field></div><button className="btn-primary">Créer l’alerte</button></form>; }

function AssignmentSection({ assignments, activeAssignments, canManageFleet, vehicles, users, assignmentForm, setAssignmentForm, saveAssignment, editingAssignment, setEditingAssignment, finishAssignment }) { return <section className="workspace"><div className="section-header"><div><p className="eyebrow">Missions et conducteurs</p><h2>Affectations <span className="count-badge">{activeAssignments.length} en cours</span></h2></div></div>{canManageFleet && <AssignmentForm form={assignmentForm} setForm={setAssignmentForm} vehicles={vehicles} users={users} submit={saveAssignment} editing={editingAssignment} cancel={() => { setEditingAssignment(null); setAssignmentForm(assignmentInitial); }} />}{assignments.length ? <div className="data-list">{assignments.map((item) => <article className="data-item" key={item._id}><div><strong>{item.vehicule?.immatriculation || 'Véhicule'}</strong><small>{item.vehicule?.marque} {item.vehicule?.modele} · conducteur : {item.conducteur?.prenom} {item.conducteur?.nom}</small><p>Début : {new Date(item.dateDebut).toLocaleDateString('fr-FR')} · {item.kmDebut} km {item.kmFin !== undefined && `→ ${item.kmFin} km`}</p></div><div className="item-actions"><span className="status">{label(item.statut)}</span>{canManageFleet && item.statut === 'en_cours' && <><button className="link-button" onClick={() => { setEditingAssignment(item); setAssignmentForm({ vehicule: item.vehicule?._id || '', conducteur: item.conducteur?._id || '', dateDebut: item.dateDebut?.slice(0, 10) || '', kmDebut: item.kmDebut, observations: item.observations || '' }); }}>Modifier</button><button className="link-button" onClick={() => finishAssignment(item)}>Terminer</button></>}</div></article>)}</div> : <p className="empty-state">Aucune affectation enregistrée.</p>}</section>; }
function AssignmentForm({ form, setForm, vehicles, users, submit, editing, cancel }) { return <form className="form-panel" onSubmit={submit}><div className="form-heading"><h3>{editing ? 'Modifier l’affectation' : 'Nouvelle affectation'}</h3>{editing && <button type="button" className="link-button" onClick={cancel}>Annuler</button>}</div><div className="form-grid"><Field label="Véhicule"><select required value={form.vehicule} onChange={(e) => setForm({ ...form, vehicule: e.target.value })}><option value="">Choisir</option>{vehicles.filter((item) => item.statut === 'disponible' || item._id === form.vehicule).map((item) => <option key={item._id} value={item._id}>{item.immatriculation} · {item.modele}</option>)}</select></Field><Field label="Conducteur"><select required value={form.conducteur} onChange={(e) => setForm({ ...form, conducteur: e.target.value })}><option value="">Choisir</option>{users.filter((item) => item.role === 'conducteur' && item.actif).map((item) => <option key={item._id} value={item._id}>{item.prenom} {item.nom}</option>)}</select></Field><Field label="Date de début"><input type="date" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} /></Field><Field label="Kilométrage de départ"><input required min="0" type="number" value={form.kmDebut} onChange={(e) => setForm({ ...form, kmDebut: e.target.value })} /></Field><Field label="Observations"><textarea value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} /></Field></div><button className="btn-primary">{editing ? 'Enregistrer' : 'Créer l’affectation'}</button></form>; }

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
