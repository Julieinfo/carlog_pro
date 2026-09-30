import { useState } from 'react';
import { api, messageErreurApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PiedDePageLegal from '../components/PiedDePageLegal';

export default function Login({ onGoToRegister, themeToggle }) {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      const res = await api.connexion({ email, motDePasse });
      // On extrait user et token qu'Axios soit déballé ou non dans api.js
      const data = res.data || res;
      login(data.user, data.token);
    } catch (err) {
      setErreur(messageErreurApi(err, 'Identifiants invalides'));
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
              <h1>Connexion</h1>
            </div>
          </div>

          <p className="auth-demo-note" role="note">
            Démonstration portfolio : utilisez uniquement des données fictives. N’y saisissez pas de données personnelles ou de flotte réelles.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <label className="field">
              <span>Mot de passe</span>
              <input
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>

            {erreur && <p className="auth-error" role="alert">{erreur}</p>}

            <button className="btn-primary auth-submit" type="submit" disabled={chargement}>
              {chargement ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="auth-switch">
            Pas encore de compte ?{' '}
            <button className="link-button" type="button" onClick={onGoToRegister}>
              Créer un compte entreprise
            </button>
          </p>

          <PiedDePageLegal />
        </section>
      </main>
    </div>
  );
}
