// Stockage de la session : localStorage quand l'utilisateur a coché « Se souvenir de moi »,
// sessionStorage sinon (la session disparaît à la fermeture du navigateur).
// Les deux emplacements ne sont jamais utilisés en même temps.
const CLE_TOKEN = 'token';
const CLE_USER = 'user';

const stockages = () => [localStorage, sessionStorage];

function lire(cle) {
  for (const stockage of stockages()) {
    try {
      const valeur = stockage.getItem(cle);
      if (valeur) return valeur;
    } catch {
      // Stockage indisponible (navigation privée) : on continue avec l'autre emplacement.
    }
  }
  return null;
}

export function lireToken() {
  return lire(CLE_TOKEN);
}

export function lireUtilisateur() {
  const brut = lire(CLE_USER);
  if (!brut) return null;
  try {
    return JSON.parse(brut);
  } catch {
    return null;
  }
}

// Indique si la session en cours est persistante, pour la réécrire au même endroit.
export function sessionPersistante() {
  try {
    return localStorage.getItem(CLE_TOKEN) !== null;
  } catch {
    return false;
  }
}

export function ecrireSession(user, token, seSouvenir) {
  effacerSession();
  const stockage = seSouvenir ? localStorage : sessionStorage;
  try {
    stockage.setItem(CLE_TOKEN, token);
    stockage.setItem(CLE_USER, JSON.stringify(user));
  } catch {
    // Si le stockage est refusé, la session reste valable en mémoire pour l'onglet courant.
  }
}

export function effacerSession() {
  for (const stockage of stockages()) {
    try {
      stockage.removeItem(CLE_TOKEN);
      stockage.removeItem(CLE_USER);
    } catch {
      // Rien à faire : l'emplacement est déjà inaccessible.
    }
  }
}
