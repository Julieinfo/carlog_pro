import { useState } from 'react';

// Champ mot de passe avec bouton d'affichage, partagé par la connexion et l'inscription.
export default function ChampMotDePasse({
  libelle,
  valeur,
  onChange,
  name,
  autoComplete,
  minLength,
}) {
  const [afficher, setAfficher] = useState(false);

  return (
    <label className="field">
      <span>{libelle}</span>
      <span className="champ-mot-de-passe">
        <input
          type={afficher ? 'text' : 'password'}
          name={name}
          value={valeur}
          onChange={onChange}
          autoComplete={autoComplete}
          minLength={minLength}
          required
        />
        <button
          type="button"
          className="bouton-oeil"
          onClick={() => setAfficher((visible) => !visible)}
          aria-label={afficher ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          aria-pressed={afficher}
          title={afficher ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          <Oeil barre={afficher} />
        </button>
      </span>
    </label>
  );
}

function Oeil({ barre }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      {barre ? (
        <path d="M4 20 20 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}
