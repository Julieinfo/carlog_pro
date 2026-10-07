import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  clearSession,
  getStoredSession,
  saveSession,
  type StoredSession,
} from '@/services/session';
import { ApiError } from '@/services/api';
import { getCurrentUser, login } from '@/services/authApi';
import type { ApiUser } from '@/types/api';

export type DemoUser = StoredSession['user'];

type SignInPayload = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: DemoUser | null;
  isLoading: boolean;
  signIn: (payload: SignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
function normalizeUser(user: ApiUser): DemoUser {
  return {
    firstName: user.prenom,
    lastName: user.nom,
    email: user.email,
    role: user.role === 'admin' ? 'Administratrice' : user.role,
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedSession = await getStoredSession();
        if (storedSession) {
          setUser(storedSession.user);
          try {
            const currentUser = await getCurrentUser();
            const normalizedUser = normalizeUser(currentUser);
            setUser(normalizedUser);
            await saveSession({ ...storedSession, user: normalizedUser });
          } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
              await clearSession();
              setUser(null);
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    void restoreSession();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      signIn: async ({ email, password }) => {
        const response = await login(email.trim().toLowerCase(), password);
        const session: StoredSession = { token: response.token, user: normalizeUser(response.user) };

        await saveSession(session);
        setUser(session.user);
      },
      signOut: async () => {
        await clearSession();
        setUser(null);
      },
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider.');
  return context;
}
