import { useEffect } from 'react';
import PiedDePageLegal from '../components/PiedDePageLegal';

// Textes rédigés à partir de l'inventaire factuel de docs/brouillon-juridique.md.
// Les seules informations que l'éditrice doit confirmer sont marquées <ACompleter> :
// elles ne sont jamais inventées (notamment aucune adresse personnelle).
const CONTACT = 'juliedecastro2003@gmail.com';
const DERNIERE_MISE_A_JOUR = '30 septembre 2026';

function ACompleter({ children }) {
  return <mark className="legal-a-completer">À COMPLÉTER — {children}</mark>;
}

function Banniere() {
  return (
    <p className="legal-banniere" role="note">
      <strong>Version provisoire.</strong> Le texte de cette page est rédigé, mais il n’est pas
      définitif : les points signalés « à compléter » attendent une confirmation et une relecture
      avant toute mise en service réelle. Aucune adresse personnelle n’est publiée à ce stade.
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

      <h2>1. Éditeur du site</h2>
      <p>
        Le site CarLog Pro est édité par <strong>Julie De Castro</strong>, personne physique agissant
        à titre non professionnel, dans le cadre d’un projet personnel de portfolio et de
        démonstration.
      </p>
      <p>
        Contact : <Mail />.
      </p>
      <p>
        <ACompleter>
          confirmer le statut d’édition à titre non professionnel et confirmer que cette adresse
          email est bien l’adresse de contact à publier.
        </ACompleter>
      </p>

      <h2>2. Directrice de la publication</h2>
      <p>La directrice de la publication est Julie De Castro.</p>

      <h2>3. Objet du site</h2>
      <p>
        CarLog Pro est une application de démonstration de gestion de flotte automobile : suivi de
        véhicules, alertes, affectations de conducteurs et statistiques de flotte. Elle est mise à
        disposition gratuitement, sans paiement ni abonnement, et ne constitue pas un service
        commercial.
      </p>
      <p>
        L’application est destinée à un usage de démonstration : les informations qui y sont saisies
        doivent être <strong>fictives</strong>. Les conditions d’accès et d’usage sont détaillées
        dans les <a href="#/cgu">conditions d’utilisation</a>.
      </p>

      <h2>4. Hébergement</h2>
      <ul>
        <li>
          <strong>Site et interface</strong> : Vercel Inc., 440 N Barranca Avenue #4133, Covina,
          CA 91723, États-Unis.
        </li>
        <li>
          <strong>API et serveur applicatif</strong> : Render Services, Inc.
          <br />
          <ACompleter>
            relever l’adresse légale exacte dans les informations officielles de Render avant
            publication. Aucune adresse n’est inventée ici.
          </ACompleter>
        </li>
        <li>
          <strong>Base de données</strong> : MongoDB Atlas, service de MongoDB, Inc.
          <br />
          <ACompleter>
            décider si ce sous-traitant est mentionné dans les mentions légales et, le cas échéant,
            relever ses coordonnées officielles.
          </ACompleter>
        </li>
      </ul>

      <h2>5. Identité de l’éditrice et anonymat</h2>
      <p>
        L’article 6 de la loi pour la confiance dans l’économie numérique (LCEN) permet à un éditeur
        personne physique non professionnel de ne pas rendre publics ses nom, prénom et adresse
        personnels, à condition de les avoir communiqués à son hébergeur et de publier l’identité et
        l’adresse de celui-ci.
      </p>
      <p>
        <ACompleter>
          vérifier que les informations d’identification personnelle ont bien été transmises à Vercel
          et à Render. Si ce n’est pas le cas, une adresse de contact postale choisie par l’éditrice
          doit être publiée : elle ne doit ni être déduite, ni être inventée.
        </ACompleter>
      </p>

      <h2>6. Propriété intellectuelle</h2>
      <p>
        Le code source, l’interface et les éléments graphiques de CarLog Pro sont protégés par le
        droit d’auteur et appartiennent à leur éditrice, à l’exception des éléments tiers
        éventuellement identifiés dans le dépôt du projet. Toute reproduction ou réutilisation non
        autorisée est interdite.
      </p>

      <h2>7. Données personnelles</h2>
      <p>
        Le site traite des données à caractère personnel. Le détail des données collectées, des
        finalités, des destinataires, des durées de conservation et des droits dont vous disposez est
        décrit dans la <a href="#/politique-confidentialite">politique de confidentialité</a>.
      </p>

      <h2>8. Contact</h2>
      <p>
        Pour toute question relative au site, à son contenu ou à vos données : <Mail />.
      </p>
    </>
  );
}

function ConditionsUtilisation() {
  return (
    <>
      <Banniere />

      <h2>Article 1 — Objet</h2>
      <p>
        Les présentes conditions régissent l’accès et l’utilisation de CarLog Pro, application de
        démonstration de gestion de flotte automobile éditée par Julie De Castro. En créant un compte
        ou en utilisant le site, vous acceptez les présentes conditions.
      </p>
      <p>
        Le service est fourni gratuitement, à titre de démonstration. Aucun paiement, abonnement ou
        engagement commercial n’est proposé.
      </p>

      <h2>Article 2 — Accès au service et inscription</h2>
      <p>
        L’accès aux fonctionnalités de gestion nécessite la création d’un compte entreprise. Les
        informations demandées à l’inscription doivent être exactes et complètes, à l’exception des
        données de démonstration visées à l’article 3.
      </p>
      <p>
        Chaque compte est rattaché à une entreprise et à un utilisateur administrateur. Les autres
        utilisateurs sont créés depuis l’application par un administrateur, avec un rôle déterminé.
        L’accès aux données est limité à l’entreprise de l’utilisateur connecté.
      </p>

      <h2>Article 3 — Données fictives : une obligation</h2>
      <p>
        CarLog Pro est une démonstration publique. <strong>Vous vous engagez à ne saisir que des
        informations fictives</strong> : aucune donnée réelle d’entreprise, de salarié, de
        conducteur, de véhicule, de client ou de partenaire ne doit être enregistrée dans
        l’application.
      </p>
      <p>
        Vous êtes responsable des informations que vous saisissez et des conséquences d’une saisie de
        données réelles effectuée en violation du présent article.
      </p>

      <h2>Article 4 — Compte utilisateur et identifiants</h2>
      <p>
        Vous êtes responsable de la confidentialité de vos identifiants et de toute activité réalisée
        depuis votre compte. Les mots de passe sont stockés sous forme hachée et ne sont jamais
        communiqués par l’application. Les sessions expirent au bout de sept jours.
      </p>
      <p>
        En cas d’utilisation non autorisée de votre compte, contactez l’adresse indiquée à
        l’article 14.
      </p>

      <h2>Article 5 — Utilisation autorisée</h2>
      <p>
        Vous êtes autorisé à utiliser le service pour découvrir ses fonctionnalités, avec des données
        fictives, dans le respect des présentes conditions et de la réglementation applicable.
      </p>

      <h2>Article 6 — Utilisation interdite</h2>
      <p>Il est notamment interdit de :</p>
      <ul>
        <li>
          tenter d’accéder aux données d’un autre compte ou d’une autre entreprise, ou contourner les
          contrôles d’accès et d’autorisation ;
        </li>
        <li>
          s’introduire dans le système d’information, perturber ou interrompre le service, ou
          solliciter de manière excessive ses ressources ;
        </li>
        <li>utiliser le site à des fins illicites, frauduleuses ou portant atteinte aux tiers ;</li>
        <li>
          extraire, reproduire ou rediffuser le contenu du site en dehors des cas autorisés par la
          loi.
        </li>
      </ul>

      <h2>Article 7 — Disponibilité, évolution et réinitialisation</h2>
      <p>
        Le service est fourni sans garantie de disponibilité, de continuité, de conservation ou de
        restauration des comptes de démonstration. Il peut être modifié, suspendu, interrompu ou
        réinitialisé à tout moment, sans préavis ni indemnité. Aucune sauvegarde des données que vous
        saisissez n’est garantie.
      </p>

      <h2>Article 8 — Absence de garantie et responsabilité</h2>
      <p>
        Les informations, alertes et indicateurs affichés sont produits à titre de démonstration et
        peuvent être inexacts ou incomplets. <strong>Aucune décision opérationnelle, de maintenance,
        de sécurité ou de gestion de flotte ne doit être prise à partir de ces éléments.</strong>
      </p>
      <p>
        Dans les limites permises par la loi, l’éditrice ne peut être tenue responsable des dommages
        indirects résultant de l’utilisation ou de l’impossibilité d’utiliser le service, ni de la
        perte de données saisies dans la démonstration.
      </p>

      <h2>Article 9 — Désactivation, suspension et suppression</h2>
      <p>
        Un compte peut être désactivé en cas de manquement aux présentes conditions, notamment en cas
        d’usage abusif ou de saisie de données réelles. La désactivation conserve actuellement les
        enregistrements associés.
      </p>
      <p>
        Vous pouvez demander à tout moment l’accès, la rectification ou la suppression des données
        liées à votre compte en écrivant à l’adresse indiquée à l’article 14. La{' '}
        <a href="#/politique-confidentialite">politique de confidentialité</a> précise les modalités
        et les durées applicables.
      </p>

      <h2>Article 10 — Propriété intellectuelle</h2>
      <p>
        Le code et les éléments graphiques du projet restent la propriété de leur éditrice, à
        l’exception des éléments tiers éventuellement identifiés dans le dépôt. L’utilisation du
        service ne confère aucun droit de propriété intellectuelle sur ces éléments.
      </p>

      <h2>Article 11 — Données personnelles</h2>
      <p>
        Le traitement des données est décrit dans la{' '}
        <a href="#/politique-confidentialite">politique de confidentialité</a>, qui fait partie
        intégrante des présentes conditions.
      </p>

      <h2>Article 12 — Modification des conditions</h2>
      <p>
        Les présentes conditions peuvent évoluer pour tenir compte des changements du service ou de
        la réglementation. La date de dernière mise à jour figure en tête de page. La poursuite de
        l’utilisation du service après une modification vaut acceptation des conditions mises à jour.
      </p>

      <h2>Article 13 — Droit applicable et juridiction compétente</h2>
      <p>
        <ACompleter>
          confirmer le droit applicable et la juridiction compétente. Ces clauses n’étaient pas
          tranchées dans le brouillon interne et ne sont pas rédigées à votre place.
        </ACompleter>
      </p>

      <h2>Article 14 — Contact</h2>
      <p>
        Pour toute question relative aux présentes conditions : <Mail />.
      </p>
    </>
  );
}

function PolitiqueConfidentialite() {
  return (
    <>
      <Banniere />

      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement des données décrites ci-dessous est Julie De Castro, éditrice
        personne physique de CarLog Pro, joignable à l’adresse <Mail />.
      </p>

      <h2>2. Données que nous traitons</h2>
      <p>
        Les données traitées sont celles que vous saisissez vous-même dans l’application, ou qui sont
        créées par votre usage du service :
      </p>
      <ul>
        <li>
          <strong>Lors de l’inscription</strong> : nom, prénom, adresse email, mot de passe (haché
          côté serveur, jamais conservé en clair), nom de l’entreprise, numéro SIRET, téléphone et
          adresse de l’entreprise.
        </li>
        <li>
          <strong>Utilisateurs de l’entreprise</strong> : nom, prénom, adresse email, téléphone,
          rôle et état actif ou désactivé.
        </li>
        <li>
          <strong>Données de flotte</strong> : véhicules (immatriculation, caractéristiques
          techniques, kilométrage, statut), alertes, affectations de conducteurs et données
          nécessaires au calcul des statistiques.
        </li>
        <li>
          <strong>Dans votre navigateur</strong> : le jeton de session et le choix du thème clair ou
          sombre sont enregistrés dans le <code>localStorage</code>. Aucun cookie publicitaire n’est
          utilisé.
        </li>
        <li>
          <strong>Chez les hébergeurs</strong> : des journaux techniques de requête, pouvant contenir
          l’adresse IP, sont traités par Vercel et Render dans le cadre de leur service, selon leurs
          propres politiques et réglages.
        </li>
      </ul>

      <h2>3. Pourquoi ces données sont traitées</h2>
      <p>
        Ces données servent uniquement à créer votre compte, à authentifier votre accès, à isoler les
        données de chaque entreprise, à faire fonctionner la démonstration de gestion de flotte
        (véhicules, alertes, affectations, statistiques) et à assurer la sécurité du service.
      </p>
      <p>
        Aucune donnée n’est utilisée à des fins publicitaires, de profilage commercial ou de revente.
      </p>

      <h2>4. Base légale du traitement</h2>
      <p>
        <ACompleter>
          confirmer la base légale de chaque traitement (exécution du contrat, intérêt légitime). Il
          s’agit d’une analyse juridique à valider, par exemple à partir des fiches et modèles de la
          CNIL : elle n’est pas tranchée à votre place ici.
        </ACompleter>
      </p>

      <h2>5. Caractère obligatoire ou facultatif</h2>
      <p>
        Les champs demandés à l’inscription sont nécessaires à la création du compte : sans eux, le
        compte ne peut pas être créé. Les autres informations (par exemple le téléphone d’un
        utilisateur ou les observations d’une affectation) restent facultatives.
      </p>

      <h2>6. Qui reçoit les données</h2>
      <p>
        Vos données ne sont ni vendues ni cédées. Elles sont accessibles aux seuls utilisateurs
        autorisés de votre entreprise, et traitées par les prestataires techniques suivants, dans la
        limite de ce qui est nécessaire à leur mission :
      </p>
      <ul>
        <li>Vercel Inc. — hébergement de l’interface du site ;</li>
        <li>Render Services, Inc. — hébergement de l’API et du serveur applicatif ;</li>
        <li>MongoDB, Inc. — hébergement de la base de données MongoDB Atlas ;</li>
        <li>
          Microsoft (OneDrive) — synchronisation des archives de sauvegarde de la base de
          démonstration.
        </li>
      </ul>

      <h2>7. Transferts hors Union européenne</h2>
      <p>
        <ACompleter>
          confirmer les régions de traitement et d’hébergement réellement utilisées chez Vercel,
          Render, MongoDB Atlas et Microsoft, ainsi que les garanties encadrant les éventuels
          transferts de données hors Union européenne.
        </ACompleter>
      </p>

      <h2>8. Combien de temps les données sont conservées</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Données</th>
              <th>Finalité</th>
              <th>Conservation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Compte utilisateur et identifiants</td>
              <td>Création du compte et authentification</td>
              <td>
                <ACompleter>durée à recopier depuis la procédure existante</ACompleter>
              </td>
            </tr>
            <tr>
              <td>Informations de l’entreprise (dont SIRET, adresse, téléphone)</td>
              <td>Identification de l’entreprise et fonctionnement du service</td>
              <td>
                <ACompleter>durée à recopier depuis la procédure existante</ACompleter>
              </td>
            </tr>
            <tr>
              <td>Utilisateurs, véhicules, alertes, affectations</td>
              <td>Fonctionnement de la démonstration de gestion de flotte</td>
              <td>
                <ACompleter>durée à recopier depuis la procédure existante</ACompleter>
              </td>
            </tr>
            <tr>
              <td>Jeton de session et thème (navigateur)</td>
              <td>Maintien de la session et préférence d’affichage</td>
              <td>Jusqu’à la déconnexion ou l’expiration du jeton (7 jours)</td>
            </tr>
            <tr>
              <td>Journaux techniques des hébergeurs</td>
              <td>Sécurité et diagnostic</td>
              <td>Selon les politiques et réglages de Vercel et Render</td>
            </tr>
            <tr>
              <td>Archives de sauvegarde</td>
              <td>Continuité et restauration de la base de démonstration</td>
              <td>7 sauvegardes quotidiennes et jusqu’à 4 sauvegardes du dimanche</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Les comptes désactivés sont actuellement conservés : l’application n’efface pas
        automatiquement les comptes inactifs.
      </p>
      <p>
        <ACompleter>
          recopier ici les durées déjà définies dans votre procédure interne, sans redéfinir une
          seconde politique, et préciser le délai résiduel de purge des sauvegardes.
        </ACompleter>
      </p>

      <h2>9. Cookies et traceurs</h2>
      <p>
        Le site n’utilise aucun cookie publicitaire et aucun outil de mesure d’audience. Le{' '}
        <code>localStorage</code> est utilisé uniquement pour maintenir votre session et mémoriser le
        thème d’affichage choisi ; ces usages sont nécessaires au fonctionnement du service. Aucun
        bandeau de consentement n’est donc affiché.
      </p>
      <p>
        Si un traceur soumis à consentement était ajouté ultérieurement, cette politique et un
        dispositif de consentement seraient mis à jour avant sa mise en service.
      </p>

      <h2>10. Sécurité</h2>
      <p>
        Les mots de passe sont hachés côté serveur et ne sont jamais renvoyés par l’API. Chaque
        requête est limitée aux données de l’entreprise de l’utilisateur connecté, les tentatives de
        connexion sont limitées et les échanges avec le site sont chiffrés en HTTPS.
      </p>

      <h2>11. Vos droits</h2>
      <p>
        Conformément au règlement général sur la protection des données, vous disposez d’un droit
        d’accès, de rectification, d’effacement, de limitation du traitement, d’opposition et de
        portabilité de vos données. Ces droits s’exercent en écrivant à <Mail />.
      </p>
      <p>
        <ACompleter>
          confirmer la procédure de vérification de l’identité du demandeur avant toute communication
          ou suppression, ainsi que le délai de réponse annoncé.
        </ACompleter>
      </p>
      <p>
        Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à
        la{' '}
        <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noreferrer">
          Commission nationale de l’informatique et des libertés (CNIL)
        </a>
        .
      </p>

      <h2>12. Public concerné</h2>
      <p>
        Le site est un outil de gestion de flotte destiné à un usage professionnel. Il n’est pas
        destiné aux mineurs et aucune donnée concernant un mineur n’est collectée
        intentionnellement.
      </p>

      <h2>13. Modification de la présente politique</h2>
      <p>
        Cette politique peut être mise à jour pour tenir compte de l’évolution du service ou de la
        réglementation. La date de dernière mise à jour figure en tête de page.
      </p>

      <h2>14. Contact</h2>
      <p>
        Pour toute question relative à cette politique ou à vos données : <Mail />.
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
