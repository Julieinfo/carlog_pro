import { apiRequest } from '@/services/api';
import type { ApiAlert, ApiVehicle, DashboardResponse } from '@/types/api';

export function getDashboard() {
  return apiRequest<DashboardResponse>('/stats');
}

export function getVehicles() {
  return apiRequest<ApiVehicle[]>('/vehicules');
}

export function getVehicle(id: string) {
  return apiRequest<ApiVehicle>(`/vehicules/${id}`);
}

export function getAlerts() {
  return apiRequest<ApiAlert[]>('/alertes');
}

export function getAlert(id: string) {
  return apiRequest<ApiAlert>(`/alertes/${id}`);
}
