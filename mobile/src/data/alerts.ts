export type AlertPriority = 'Information' | 'Moyenne' | 'Élevée' | 'Critique';
export type AlertStatus = 'Active' | 'Traitée';

export type FleetAlert = {
  id: string;
  title: string;
  description: string;
  vehicleId: string;
  vehicleName: string;
  priority: AlertPriority;
  status: AlertStatus;
  createdAt: string;
};

export const alerts: FleetAlert[] = [
  { id: 'carburant-renault', title: 'Mettre de l’essence', description: 'Le niveau de carburant de la Renault Mégane est faible. Un plein est recommandé.', vehicleId: 'renault-megane', vehicleName: 'Renault Mégane · FF-069-VC', priority: 'Moyenne', status: 'Active', createdAt: '02/10/2026' },
  { id: 'controle-fiat', title: 'Contrôle technique à prévoir', description: 'Le contrôle technique de la Fiat Panda arrive à échéance. Planifiez une intervention.', vehicleId: 'fiat-panda', vehicleName: 'Fiat Panda · GQ-639-LB', priority: 'Élevée', status: 'Active', createdAt: '01/10/2026' },
  { id: 'entretien-toyota', title: 'Entretien annuel validé', description: 'L’entretien annuel de la Toyota Aygo a été enregistré avec succès.', vehicleId: 'toyota-aygo', vehicleName: 'Toyota Aygo · FK-868-VS', priority: 'Information', status: 'Traitée', createdAt: '24/09/2026' },
];
