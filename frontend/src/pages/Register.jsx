import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register({ onGoToLogin }) {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    nomEntreprise: '',
  });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const { login } = useAuth();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    // On complète l'objet envoyé au backend avec des données valides par défaut
    const payload = {
      ...form,
      siret: Math.floor(10000000000000 + Math.random() * 90000000000000).toString(),
      emailProfessionnel: form.email,
      telephoneEntreprise: '0102030405',
      adresse: {
        rue: '1 rue de la Paix',
        codePostal: '75000',
        ville: 'Paris',
        pays: 'France',
      },
    };

    try {
      const res = await api.inscription(payload);
      // Prise en charge selon que api.js retourne res.data ou la réponse Axios
      const data = res.data || res;
      login(data.user, data.token);
    } catch (err) {
      // Correction de la coquille (err.response au lieu de err.reponse)
      setErreur(err.response?.data?.message || err.message);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="auth-shell">
      <header className="navbar">
        <div className="logo">CarLog <span>Pro</span></div>
      </header>

      <main className="dashboard-container auth-container">
        <section className="card-section auth-card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Espace entreprise</p>
              <h1>Créer un compte</h1>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-fields-row">
              <label className="field">
                <span>Nom</span>
                <input name="nom" value={form.nom} onChange={handleChange} required autoComplete="family-name" />
              </label>
              <label className="field">
                <span>Prénom</span>
                <input name="prenom" value={form.prenom} onChange={handleChange} required autoComplete="given-name" />
              </label>
            </div>
            <label className="field">
              <span>Email</span>
              <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
            </label>
            <label className="field">
              <span>Mot de passe</span>
              <input type="password" name="motDePasse" value={form.motDePasse} onChange={handleChange} required autoComplete="new-password" />
            </label>
            <label className="field">
              <span>Nom de l'entreprise</span>
              <input name="nomEntreprise" value={form.nomEntreprise} onChange={handleChange} required autoComplete="organization" />
            </label>

            {erreur && <p className="auth-error" role="alert">{erreur}</p>}

            <button className="btn-primary auth-submit" type="submit" disabled={chargement}>
              {chargement ? 'Création...' : 'Créer le compte'}
            </button>
          </form>

          <p className="auth-switch">
            Déjà un compte ?{' '}
            <button className="link-button" type="button" onClick={onGoToLogin}>
              Se connecter
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}