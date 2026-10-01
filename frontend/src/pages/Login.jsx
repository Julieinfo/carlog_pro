import { useState } from 'react';
import { api, messageErreurApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChampMotDePasse from '../components/ChampMotDePasse';
import PiedDePageLegal from '../components/PiedDePageLegal';

export default function Login({ onGoToRegister, themeToggle }) {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [seSouvenir, setSeSouvenir] = useState(true);
  const [aideMotDePasse, setAideMotDePasse] = useState(false);
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
      login(data.user, data.token, seSouvenir);
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
            Démonstration portfolio : utilisez uniquement des données fictives. N'y saisissez pas de données personnelles ou de flotte réelles.
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
            <ChampMotDePasse
              libelle="Mot de passe"
              valeur={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              autoComplete="current-password"
            />

            <div className="auth-options">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={seSouvenir}
                  onChange={(e) => setSeSouvenir(e.target.checked)}
                />
                <span>Se souvenir de moi</span>
              </label>
              <button
                className="link-button"
                type="button"
                onClick={() => setAideMotDePasse((ouvert) => !ouvert)}
                aria-expanded={aideMotDePasse}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {aideMotDePasse && (
              <p className="auth-help" role="note">
                La réinitialisation automatique par email n’est pas disponible dans cette
                démonstration. Pour demander une réinitialisation, écrivez à{' '}
                <a href="mailto:juliedecastro2003@gmail.com">juliedecastro2003@gmail.com</a>.
              </p>
            )}

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
