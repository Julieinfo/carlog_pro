import { useState } from 'react';
import { api, messageErreurApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register({ onGoToLogin, themeToggle }) {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    nomEntreprise: '',
    siret: '',
    telephoneEntreprise: '',
    adresseRue: '',
    adresseCodePostal: '',
    adresseVille: '',
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

    const { nom, prenom, email, motDePasse, nomEntreprise, siret, telephoneEntreprise,
      adresseRue, adresseCodePostal, adresseVille } = form;
    const payload = {
      nom,
      prenom,
      email,
      motDePasse,
      nomEntreprise,
      siret,
      emailProfessionnel: email,
      telephoneEntreprise,
      adresse: {
        rue: adresseRue,
        codePostal: adresseCodePostal,
        ville: adresseVille,
        pays: 'France',
      },
    };

    try {
      const res = await api.inscription(payload);
      // Prise en charge selon que api.js retourne res.data ou la réponse Axios
      const data = res.data || res;
      login(data.user, data.token);
    } catch (err) {
      setErreur(messageErreurApi(err, 'Impossible de créer le compte.'));
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="auth-shell">
      <header className="navbar">
        <div className="logo">CarLog <span>Pro</span></div>
        {themeToggle}
      </header>

      <main className="dashboard-container auth-container">
        <section className="card-section auth-card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Espace entreprise</p>
              <h1>Créer un compte</h1>
            </div>
          </div>

          <p className="auth-demo-note" role="note">
            Démonstration portfolio : utilisez uniquement des données fictives. N’y saisissez pas de données personnelles ou de flotte réelles.
          </p>

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
            <label className="field">
              <span>SIRET</span>
              <input
                type="text"
                name="siret"
                value={form.siret}
                onChange={handleChange}
                required
                pattern="[0-9]{14}"
                maxLength={14}
                title="Le SIRET doit contenir exactement 14 chiffres."
                inputMode="numeric"
                autoComplete="off"
              />
            </label>
            <label className="field">
              <span>Téléphone de l'entreprise</span>
              <input type="tel" name="telephoneEntreprise" value={form.telephoneEntreprise} onChange={handleChange} required autoComplete="tel" />
            </label>
            <label className="field">
              <span>Rue</span>
              <input name="adresseRue" value={form.adresseRue} onChange={handleChange} required autoComplete="address-line1" />
            </label>
            <label className="field">
              <span>Code postal</span>
              <input
                type="text"
                name="adresseCodePostal"
                value={form.adresseCodePostal}
                onChange={handleChange}
                required
                pattern="[0-9]{5}"
                maxLength={5}
                title="Le code postal doit contenir 5 chiffres."
                inputMode="numeric"
                autoComplete="postal-code"
              />
            </label>
            <label className="field">
              <span>Ville</span>
              <input name="adresseVille" value={form.adresseVille} onChange={handleChange} required autoComplete="address-level2" />
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
