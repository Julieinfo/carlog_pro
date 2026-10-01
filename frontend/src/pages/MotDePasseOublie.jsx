import { useState } from 'react';
import PiedDePageLegal from '../components/PiedDePageLegal';

// Page publique « Mot de passe oublié ? ». La réinitialisation automatique par email étant
// hors périmètre MVP, le formulaire ne déclenche aucun envoi : il valide l'adresse puis
// indique la marche à suivre. Aucun appel API n'est fait ici.
const MOTIF_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT = 'juliedecastro2003@gmail.com';

export default function MotDePasseOublie({ themeToggle }) {
  const [email, setEmail] = useState('');
  const [erreur, setErreur] = useState('');
  const [demandeEnvoyee, setDemandeEnvoyee] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!MOTIF_EMAIL.test(email.trim())) {
      setErreur('Saisissez une adresse e-mail valide.');
      return;
    }
    setErreur('');
    setDemandeEnvoyee(true);
  }

  function revenirConnexion() {
    window.location.hash = '';
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
              <h1>Mot de passe oublié ?</h1>
            </div>
          </div>

          <p className="auth-demo-note" role="note">
            Démonstration portfolio : l’envoi automatique d’emails n’est pas activé sur ce site.
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="field">
              <span>Adresse e-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>

            {erreur && <p className="auth-error" role="alert">{erreur}</p>}

            {demandeEnvoyee && (
              <p className="auth-help" role="status">
                Aucun email n’est envoyé par cette démonstration. Pour réinitialiser votre mot de
                passe, écrivez à <a href={`mailto:${CONTACT}`}>{CONTACT}</a> depuis l’adresse de
                votre compte.
              </p>
            )}

            <button className="btn-primary auth-submit" type="submit">
              Envoyer le lien
            </button>
          </form>

          <p className="auth-switch">
            <button className="link-button" type="button" onClick={revenirConnexion}>
              ← Retour à la connexion
            </button>
          </p>

          <PiedDePageLegal />
        </section>
      </main>
    </div>
  );
}
