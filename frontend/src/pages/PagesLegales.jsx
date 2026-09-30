import { useEffect } from 'react';
import PiedDePageLegal from '../components/PiedDePageLegal';

// Document provisoire : le contenu factuel vient de docs/brouillon-juridique.md.
// Les informations que seule Julie peut confirmer sont marquées <ACompleter> et ne sont
// jamais inventées (notamment aucune adresse personnelle).
const CONTACT = 'juliedecastro2003@gmail.com';
const DERNIERE_MISE_A_JOUR = '30 septembre 2026';

function ACompleter({ children }) {
  return <mark className="legal-a-completer">À COMPLÉTER — {children}</mark>;
}

function Banniere() {
  return (
    <p className="legal-banniere" role="note">
      <strong>Version provisoire.</strong> Ce document n’est pas encore définitif et ne doit pas
      être considéré comme validé avant une mise en service réelle. Les points signalés
      « à compléter » attendent une confirmation : aucun élément n’a été inventé, et aucune
      adresse personnelle n’est publiée à ce stade.
    </p>
  );
}

function Mail() {
  return <a href={`mailto:${CONTACT}`}>{CONTACT}</a>;
}

function MentionsLegales() {
  return (
    <>
      <Banniere />

      <h2>Éditeur du site</h2>
      <p>
        CarLog Pro est une application de démonstration de gestion de flotte automobile, développée
        et éditée par <strong>Julie De Castro</strong>, personne physique, à titre non professionnel,
        dans le cadre d’un projet personnel de portfolio. Le site ne propose ni paiement, ni
        abonnement, ni service commercial.
      </p>
      <p>
        Directrice de la publication : Julie De Castro. Contact : <Mail />.
      </p>
      <p>
        <ACompleter>
          confirmer le statut d’édition à titre non professionnel et confirmer que l’adresse email
          ci-dessus est bien l’adresse de contact à publier.
        </ACompleter>
      </p>

      <h2>Hébergement</h2>
      <ul>
        <li>
          <strong>Site (interface)</strong> : Vercel Inc., 440 N Barranca Avenue #4133, Covina,
          CA 91723, États-Unis.
        </li>
        <li>
          <strong>API (serveur applicatif)</strong> : Render Services, Inc.
          <br />
          <ACompleter>
            relever l’adresse légale exacte dans les informations officielles de Render avant
            publication. Aucune adresse n’est inventée ici.
          </ACompleter>
        </li>
        <li>
          <strong>Base de données</strong> : MongoDB Atlas (MongoDB, Inc.).
          <br />
          <ACompleter>
            décider si ce sous-traitant est mentionné dans les mentions légales et, le cas échéant,
            relever ses coordonnées officielles.
          </ACompleter>
        </li>
      </ul>

      <h2>Identité de l’éditeur et anonymat</h2>
      <p>
        L’article 6 de la loi pour la confiance dans l’économie numérique (LCEN) permet à un éditeur
        personne physique non professionnel de ne pas rendre publiques ses nom, prénom et adresse
        personnels, à condition de les avoir communiqués à son hébergeur et de publier l’identité et
        l’adresse de celui-ci.
      </p>
      <p>
        <ACompleter>
          vérifier que les informations d’identification personnelle ont bien été transmises à Vercel
          et à Render. Si ce n’est pas le cas, une adresse de contact postale choisie par l’éditrice
          doit être publiée — elle ne doit ni être déduite, ni être inventée.
        </ACompleter>
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Le code et les éléments graphiques de CarLog Pro appartiennent à leur éditrice, à l’exception
        des éléments tiers éventuellement identifiés dans le dépôt du projet.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Le traitement des données est décrit dans la{' '}
        <a href="#/politique-confidentialite">politique de confidentialité</a>. Les conditions
        d’utilisation du service figurent dans les{' '}
        <a href="#/cgu">conditions d’utilisation</a>.
      </p>
    </>
  );
}

function ConditionsUtilisation() {
  return (
    <>
      <Banniere />

      <h2>Objet et accès</h2>
      <p>
        CarLog Pro est un projet personnel de portfolio fourni à titre de démonstration. L’inscription
        et l’accès à cette version ne donnent lieu à aucun paiement ni à aucun abonnement achetable.
      </p>
      <p>
        <strong>L’utilisateur s’engage à ne saisir que des informations fictives.</strong> Il ne doit
        enregistrer aucune donnée réelle d’entreprise, de salarié, de conducteur, de véhicule ou de
        client.
      </p>

      <h2>Utilisation autorisée et interdite</h2>
      <p>
        L’accès est autorisé pour découvrir les fonctions de la démonstration. Il est interdit de
        tenter d’accéder aux données d’un autre compte, de contourner les contrôles d’accès,
        d’interrompre le service ou d’utiliser le site à des fins illicites. Un compte peut être
        désactivé en cas d’usage abusif.
      </p>
      <p>
        Une désactivation conserve actuellement les enregistrements associés. Les demandes d’accès, de
        rectification ou de suppression peuvent être adressées au contact indiqué dans la{' '}
        <a href="#/politique-confidentialite">politique de confidentialité</a>.
      </p>

      <h2>Disponibilité et données de démonstration</h2>
      <p>
        Le site est fourni sans garantie de disponibilité, de conservation ou de restauration des
        comptes de démonstration. Le service peut évoluer, être interrompu ou être réinitialisé à tout
        moment. Aucune décision opérationnelle de flotte ne doit être prise à partir de ces données ou
        des indicateurs affichés.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Le code et les éléments graphiques sont ceux du projet CarLog Pro, à l’exception des éléments
        tiers éventuellement identifiés dans le dépôt du projet.
      </p>

      <h2>Droit applicable</h2>
      <p>
        <ACompleter>
          confirmer le droit applicable et la juridiction compétente. Ces clauses n’étaient pas
          tranchées dans le brouillon interne.
        </ACompleter>
      </p>

      <h2>Contact</h2>
      <p>
        Toute question ou demande peut être envoyée à <Mail />.
      </p>
    </>
  );
}

function PolitiqueConfidentialite() {
  return (
    <>
      <Banniere />

      <h2>Responsable du traitement</h2>
      <p>
        Le responsable du traitement est Julie De Castro, éditrice personne physique de CarLog Pro,
        joignable à l’adresse <Mail />.
      </p>

      <h2>Données traitées</h2>
      <p>L’application permet d’enregistrer les données suivantes :</p>
      <ul>
        <li>
          <strong>À l’inscription</strong> : nom, prénom, adresse email, mot de passe (haché côté
          serveur), nom de l’entreprise, SIRET, téléphone et adresse de l’entreprise.
        </li>
        <li>
          <strong>Dans l’application</strong> : utilisateurs de l’entreprise (nom, prénom, email,
          téléphone, rôle, état actif), véhicules (immatriculation, caractéristiques, kilométrage),
          alertes, affectations et données de flotte nécessaires aux statistiques.
        </li>
        <li>
          <strong>Dans le navigateur</strong> : le jeton de session (JWT) et le choix du thème
          clair/sombre sont conservés dans le <code>localStorage</code>.
        </li>
        <li>
          <strong>Chez les hébergeurs</strong> : les journaux techniques de requête, dont l’adresse
          IP, peuvent être traités par Vercel et Render selon leurs propres politiques et réglages.
        </li>
      </ul>

      <h2>Finalités et base légale</h2>
      <p>
        Ces données servent à créer un compte et à faire fonctionner la démonstration de gestion de
        flotte.
      </p>
      <p>
        <ACompleter>
          confirmer la base légale de chaque traitement (exécution du contrat, intérêt légitime).
          Cette analyse doit être validée, par exemple à partir des modèles de la CNIL.
        </ACompleter>
      </p>

      <h2>Destinataires</h2>
      <p>
        Les destinataires techniques identifiés dans le déploiement sont Vercel (interface), Render
        (API), MongoDB Atlas (base de données) et OneDrive / Microsoft (synchronisation des archives
        de sauvegarde). Aucune donnée n’est vendue ni transmise à des fins publicitaires.
      </p>

      <h2>Transferts hors Union européenne</h2>
      <p>
        <ACompleter>
          confirmer les régions de traitement et d’hébergement réellement utilisées chez Vercel,
          Render, MongoDB Atlas et Microsoft, ainsi que les garanties encadrant les éventuels
          transferts hors Union européenne.
        </ACompleter>
      </p>

      <h2>Durées de conservation</h2>
      <p>
        Les comptes désactivés sont actuellement conservés (désactivation logique) : le code ne
        supprime pas automatiquement les comptes inactifs. Les archives de sauvegarde appliquent une
        rétention de sept sauvegardes quotidiennes et jusqu’à quatre sauvegardes du dimanche.
      </p>
      <p>
        <ACompleter>
          recopier ici les durées et la procédure déjà définies par l’éditrice, sans redéfinir une
          seconde politique, et préciser le délai résiduel de purge des sauvegardes.
        </ACompleter>
      </p>

      <h2>Cookies et traceurs</h2>
      <p>
        Le site ne met en place aucun cookie publicitaire ni outil de mesure d’audience. Le{' '}
        <code>localStorage</code> est utilisé uniquement pour maintenir la session et mémoriser le
        thème choisi. Aucun bandeau de consentement n’est donc affiché : si un traceur soumis à
        consentement est ajouté plus tard, cette page et un bandeau devront être mis à jour.
      </p>

      <h2>Vos droits</h2>
      <p>
        Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, d’effacement, de
        limitation, d’opposition et de portabilité de vos données. Ces demandes peuvent être
        adressées à <Mail />.
      </p>
      <p>
        <ACompleter>
          confirmer la procédure de vérification de l’identité du demandeur avant toute communication
          ou suppression, et le délai de réponse annoncé.
        </ACompleter>
      </p>
      <p>
        En cas de désaccord, une réclamation peut être déposée auprès de la{' '}
        <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noreferrer">
          CNIL
        </a>
        .
      </p>

      <h2>Sécurité</h2>
      <p>
        Les mots de passe sont hachés côté serveur et ne sont jamais renvoyés par l’API. Chaque
        requête est limitée aux données de l’entreprise de l’utilisateur connecté, et les échanges
        avec le site sont chiffrés en HTTPS.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question sur cette politique : <Mail />.
      </p>
    </>
  );
}

// Slugs utilisés dans l'URL (ancre) et dans le sitemap public.
const DOCUMENTS = {
  'mentions-legales': {
    titre: 'Mentions légales',
    description: 'Éditeur, hébergement et propriété intellectuelle de CarLog Pro.',
    Contenu: MentionsLegales,
  },
  cgu: {
    titre: 'Conditions d’utilisation',
    description: 'Règles d’accès et d’usage de la démonstration CarLog Pro.',
    Contenu: ConditionsUtilisation,
  },
  'politique-confidentialite': {
    titre: 'Politique de confidentialité',
    description: 'Données traitées, finalités, destinataires, durées et droits RGPD.',
    Contenu: PolitiqueConfidentialite,
  },
};

export const SLUGS_PAGES_LEGALES = Object.keys(DOCUMENTS);

// Lit l'ancre de l'URL (#/mentions-legales) sans ajouter de dépendance de routage.
export function slugPageLegale(hash = window.location.hash) {
  const slug = String(hash).replace(/^#\/?/, '');
  return SLUGS_PAGES_LEGALES.includes(slug) ? slug : null;
}

function fermerPageLegale() {
  window.location.hash = '';
}

export default function PagesLegales({ slug, themeToggle }) {
  const fiche = DOCUMENTS[slug];

  useEffect(() => {
    if (!fiche) return undefined;
    const titrePrecedent = document.title;
    document.title = `${fiche.titre} — CarLog Pro`;
    return () => {
      document.title = titrePrecedent;
    };
  }, [fiche]);

  if (!fiche) return null;

  const Contenu = fiche.Contenu;

  return (
    <div className="auth-shell">
      <header className="navbar">
        <div className="logo">CarLog <span>Pro</span></div>
        {themeToggle}
      </header>

      <main className="dashboard-container auth-container">
        <article className="card-section legal-document">
          <div className="section-header">
            <div>
              <p className="eyebrow">Informations légales</p>
              <h1>{fiche.titre}</h1>
            </div>
          </div>

          <p className="legal-meta">Dernière mise à jour : {DERNIERE_MISE_A_JOUR}</p>

          <Contenu />

          <nav className="legal-retour">
            <button className="btn-secondary" type="button" onClick={fermerPageLegale}>
              Retour à l’application
            </button>
            {SLUGS_PAGES_LEGALES.filter((autre) => autre !== slug).map((autre) => (
              <a className="link-button" key={autre} href={`#/${autre}`}>
                {DOCUMENTS[autre].titre}
              </a>
            ))}
          </nav>
        </article>

        <PiedDePageLegal />
      </main>
    </div>
  );
}
