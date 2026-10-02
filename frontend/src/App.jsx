import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PagesLegales, { slugPageLegale } from './pages/PagesLegales';
import MotDePasseOublie from './pages/MotDePasseOublie';
import { useEffect, useState } from 'react';
import ThemeToggle from './components/ThemeToggle';

const ANCRE_MOT_DE_PASSE_OUBLIE = '#/mot-de-passe-oublie';

export default function App() {
  const { isAuthenticated, verification } = useAuth();
  const [pageAuth, setPageAuth] = useState('login'); // 'login' ou 'register'
  const [pageLegale, setPageLegale] = useState(slugPageLegale);
  const [motDePasseOublie, setMotDePasseOublie] = useState(
    () => window.location.hash === ANCRE_MOT_DE_PASSE_OUBLIE,
  );
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('carlog-theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('carlog-theme', theme);
    } catch {
      // Le thème reste appliqué pour la session même si le stockage est indisponible.
    }
  }, [theme]);

  useEffect(() => {
    const surChangementAncre = () => {
      setPageLegale(slugPageLegale());
      setMotDePasseOublie(window.location.hash === ANCRE_MOT_DE_PASSE_OUBLIE);
    };
    window.addEventListener('hashchange', surChangementAncre);
    return () => window.removeEventListener('hashchange', surChangementAncre);
  }, []);

  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark');
  const themeToggle = <ThemeToggle theme={theme} onToggle={toggleTheme} />;

  // Pages publiques accessibles sans session, y compris pendant la vérification du jeton.
  if (pageLegale) return <PagesLegales slug={pageLegale} themeToggle={themeToggle} />;
  if (motDePasseOublie) return <MotDePasseOublie themeToggle={themeToggle} />;

  if (verification) {
    return (
      <div className="auth-shell app-loading" role="status" aria-live="polite">
        <div className="loading-card">
          <strong>CarLog Pro</strong>
          <p>Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return pageAuth === 'login' ? (
      <Login onGoToRegister={() => setPageAuth('register')} themeToggle={themeToggle} />
    ) : (
      <Register onGoToLogin={() => setPageAuth('login')} themeToggle={themeToggle} />
    );
  }

  return <Dashboard themeToggle={themeToggle} />;
}
