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
const DEMO_EMAIL = 'julie@carlogpro.demo';
const DEMO_PASSWORD = 'CarLog2026!';

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedSession = await getStoredSession();
        if (storedSession) setUser(storedSession.user);
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
        await new Promise((resolve) => setTimeout(resolve, 700));

        if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
          throw new Error('Adresse e-mail ou mot de passe incorrect.');
        }

        const session: StoredSession = {
          token: 'demo-session-carlog-pro',
          user: {
            firstName: 'Julie',
            lastName: 'De Castro',
            email: DEMO_EMAIL,
            role: 'Administratrice',
          },
        };

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
