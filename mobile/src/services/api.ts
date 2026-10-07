import { clearSession, getStoredSession } from '@/services/session';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
if (!configuredUrl) {
  throw new Error('EXPO_PUBLIC_API_URL est manquante. Vérifiez le fichier .env.');
}

const API_URL = configuredUrl.replace(/\/+$/, '').replace(/\/api$/, '');

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  authenticated?: boolean;
};

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, authenticated = true, headers, ...rest } = options;
  const session = authenticated ? await getStoredSession() : null;
  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as { message?: string } | T | null;
  if (response.status === 401) {
    await clearSession();
    throw new ApiError('Votre session a expiré. Veuillez vous reconnecter.', 401);
  }
  if (response.status === 429) {
    throw new ApiError('Connexion temporairement indisponible. Réessayez plus tard.', 429);
  }
  if (!response.ok) {
    const message = data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
      ? data.message
      : 'Une erreur est survenue lors de la communication avec le serveur.';
    throw new ApiError(message, response.status);
  }
  return data as T;
}
