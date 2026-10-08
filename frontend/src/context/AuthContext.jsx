import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { lireToken, sessionPersistante, ecrireSession, effacerSession } from '../services/stockageSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [verification, setVerification] = useState(true);

  // Au montage, on valide le token côté API et on restaure les données de profil à jour.
  useEffect(() => {
    let mounted = true;

    async function verifierSession() {
      const savedToken = lireToken();
      if (!savedToken) {
        effacerSession();
        if (mounted) setVerification(false);
        return;
      }

      try {
        const response = await api.getProfil();
        const userData = response.data || response;
        if (!mounted) return;

        setToken(savedToken);
        setUser(userData);
        // On réécrit la session dans le même emplacement qu'à la connexion.
        ecrireSession(userData, savedToken, sessionPersistante());
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

  // seSouvenir omis (ex. rafraîchissement du profil) : on conserve l'emplacement déjà utilisé.
  const login = (userData, tokenValue, seSouvenir) => {
    const persistant = seSouvenir === undefined ? sessionPersistante() : seSouvenir;
    ecrireSession(userData, tokenValue, persistant);

    setUser(userData);
    setToken(tokenValue);
  };

  function logout() {
    setUser(null);
    setToken(null);
    effacerSession();
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
