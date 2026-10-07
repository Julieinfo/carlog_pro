export type VehicleStatus = 'Disponible' | 'En circulation' | 'En entretien' | 'Immobilisé';

export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  plate: string;
  mileage: number;
  status: VehicleStatus;
  assignedTo: string | null;
  lastFuelDate: string;
  lastFuelAmount: number;
  averageConsumption: number;
  nextMaintenanceDate: string;
  monthlyTco: number;
  activeAlerts: number;
};

export const vehicles: Vehicle[] = [
  { id: 'renault-megane', brand: 'Renault', model: 'Mégane', plate: 'FF-069-VC', mileage: 48230, status: 'En circulation', assignedTo: 'Thomas Bernard', lastFuelDate: '02/10/2026', lastFuelAmount: 78.38, averageConsumption: 5.9, nextMaintenanceDate: '14/10/2026', monthlyTco: 585.8, activeAlerts: 1 },
  { id: 'fiat-panda', brand: 'Fiat', model: 'Panda', plate: 'GQ-639-LB', mileage: 31805, status: 'En circulation', assignedTo: 'Camille Martin', lastFuelDate: '26/09/2026', lastFuelAmount: 56.78, averageConsumption: 5.4, nextMaintenanceDate: '29/09/2026', monthlyTco: 484.5, activeAlerts: 1 },
  { id: 'toyota-aygo', brand: 'Toyota', model: 'Aygo', plate: 'FK-868-VS', mileage: 18420, status: 'Disponible', assignedTo: null, lastFuelDate: '18/09/2026', lastFuelAmount: 42.2, averageConsumption: 4.6, nextMaintenanceDate: '06/11/2026', monthlyTco: 178.2, activeAlerts: 0 },
];
