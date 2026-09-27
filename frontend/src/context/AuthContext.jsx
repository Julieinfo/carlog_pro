import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [verification, setVerification] = useState(true);

  // Au montage, on valide le token côté API et on restaure les données de profil à jour.
  useEffect(() => {
    let mounted = true;

    async function verifierSession() {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        localStorage.removeItem('user');
        if (mounted) setVerification(false);
        return;
      }

      try {
        const response = await api.getProfil();
        const userData = response.data || response;
        if (!mounted) return;

        setToken(savedToken);
        setUser(userData);
        localStorage.setItem('token', savedToken);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch {
        if (mounted) logout();
      } finally {
        if (mounted) setVerification(false);
      }
    }

    verifierSession();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    window.addEventListener('auth:session-expired', logout);
    return () => window.removeEventListener('auth:session-expired', logout);
  }, []);

  const login = (userData, tokenValue) => {
    // 1. Sauvegarde dans le localStorage
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));

    // 2. Mise à jour de l'état React
    setUser(userData);
    setToken(tokenValue);
  };

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  const value = { user, token, login, logout, verification, isAuthenticated: !!token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>');
  }
  return context;
}
