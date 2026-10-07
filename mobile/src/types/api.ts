export type ApiUser = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: string;
  entrepriseId?: string;
  abonnement?: string | null;
};

export type LoginResponse = {
  token: string;
  user: ApiUser;
};

export type ApiVehicle = {
  _id: string;
  marque: string;
  modele: string;
  immatriculation: string;
  kilometrage: number;
  statut: 'disponible' | 'en_circulation' | 'en_entretien' | 'immobilise' | string;
};

export type ApiAlert = {
  _id: string;
  titre: string;
  description?: string;
  priorite?: string;
  statut?: string;
  vehicule?: { _id?: string; marque?: string; modele?: string; immatriculation?: string } | string;
  createdAt?: string;
};

export type DashboardResponse = Record<string, unknown>;
