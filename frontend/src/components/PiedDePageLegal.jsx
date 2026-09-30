// Liens vers les documents légaux. Accessibles sans être connecté et depuis le dashboard,
// car des mentions légales doivent rester joignables depuis n'importe quel écran.
export default function PiedDePageLegal() {
  return (
    <footer className="pied-legal">
      <a href="#/mentions-legales">Mentions légales</a>
      <a href="#/cgu">Conditions d’utilisation</a>
      <a href="#/politique-confidentialite">Politique de confidentialité</a>
    </footer>
  );
}
