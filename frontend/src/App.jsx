import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { useEffect, useState } from 'react';
import ThemeToggle from './components/ThemeToggle';

export default function App() {
  const { isAuthenticated, verification } = useAuth();
  const [pageAuth, setPageAuth] = useState('login'); // 'login' ou 'register'
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

  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark');
  const themeToggle = <ThemeToggle theme={theme} onToggle={toggleTheme} />;

  if (verification) return <p>Chargement...</p>;

  if (!isAuthenticated) {
    return pageAuth === 'login' ? (
      <Login onGoToRegister={() => setPageAuth('register')} themeToggle={themeToggle} />
    ) : (
      <Register onGoToLogin={() => setPageAuth('login')} themeToggle={themeToggle} />
    );
  }

  return <Dashboard themeToggle={themeToggle} />;
}
