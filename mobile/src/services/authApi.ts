import { apiRequest } from '@/services/api';
import type { LoginResponse, ApiUser } from '@/types/api';

export function login(email: string, password: string) {
  return apiRequest<LoginResponse>('/auth/connexion', {
    method: 'POST',
    authenticated: false,
    body: { email, motDePasse: password },
  });
}

export function getCurrentUser() {
  return apiRequest<ApiUser>('/auth/me');
}
