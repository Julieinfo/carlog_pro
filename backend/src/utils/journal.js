const ecrire = (niveau, evenement, contexte = {}) => {
  const entree = {
    timestamp: new Date().toISOString(),
    level: niveau,
    event: evenement,
    ...contexte
  };
  const sortie = niveau === 'error' ? console.error : console.log;
  sortie(JSON.stringify(entree));
};

const contexteRequete = (req) => ({
  requestId: req.id,
  cfRay: typeof req.get === 'function' ? req.get('cf-ray') || undefined : undefined,
  method: req.method,
  path: req.path
});

module.exports = { ecrire, contexteRequete };
