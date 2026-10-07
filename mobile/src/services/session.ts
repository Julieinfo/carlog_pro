import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'carlog-pro-session';

export type StoredSession = {
  token: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
};

export async function getStoredSession(): Promise<StoredSession | null> {
  const rawSession = await SecureStore.getItemAsync(SESSION_KEY);

  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession) as StoredSession;
  } catch {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }
}

export async function saveSession(session: StoredSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
