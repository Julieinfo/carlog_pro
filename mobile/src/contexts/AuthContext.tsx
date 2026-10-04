import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';

export type DemoUser = { firstName: string; lastName: string; email: string; role: 'Administratrice' };
type AuthContextValue = { user: DemoUser | null; isLoading: boolean; signIn: () => void; signOut: () => void };
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const value = useMemo(() => ({
    user, isLoading: false,
    signIn: () => setUser({ firstName: 'Julie', lastName: 'De Castro', email: 'julie@carlogpro.demo', role: 'Administratrice' }),
    signOut: () => setUser(null),
  }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider.');
  return context;
}
