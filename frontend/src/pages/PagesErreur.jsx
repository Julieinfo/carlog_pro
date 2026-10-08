export function Page404({ themeToggle, onHome }) {
  return (
    <div className="auth-shell status-page">
      <header className="navbar">
        <button className="logo logo-button" type="button" onClick={onHome} aria-label="Retourner à l’accueil">
          CarLog <span>Pro</span>
        </button>
        {themeToggle}
      </header>
      <main className="status-card" role="main">
        <p className="eyebrow">Erreur 404</p>
        <h1>Page introuvable</h1>
        <p>La page demandée n'existe pas ou n'est plus disponible.</p>
        <button className="btn-primary" type="button" onClick={onHome}>Retourner à l'accueil</button>
      </main>
    </div>
  );
}

export function PageAccesRefuse({ themeToggle, message = 'Votre rôle ne permet pas d’accéder à cette page.', onHome }) {
  return (
    <div className="auth-shell status-page">
      <header className="navbar">
        <button className="logo logo-button" type="button" onClick={onHome} aria-label="Retourner au tableau de bord">
          CarLog <span>Pro</span>
        </button>
        {themeToggle}
      </header>
      <main className="status-card" role="alert">
        <p className="eyebrow">Accès contrôlé</p>
        <h1>Accès refusé</h1>
        <p>{message}</p>
        <button className="btn-primary" type="button" onClick={onHome}>Retourner au tableau de bord</button>
      </main>
    </div>
  );
}
