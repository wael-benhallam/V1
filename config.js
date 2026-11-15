/**
 * ─────────────────────────────────────────────────────────────
 *  CONFIGURATION CENTRALISÉE DU SITE
 *  Toutes les valeurs modifiables sont ici. Aucun autre fichier
 *  n'a besoin d'être touché pour mettre le site en ligne.
 * ─────────────────────────────────────────────────────────────
 */
window.SITE_CONFIG = {
  // ── Identité ────────────────────────────────────────────────
  brand: {
    name: "Wael Benhallam",
    role: "Automatisation IA pour cabinets, établissements & PME",
    city: "Paris",
    siteUrl: "https://bistouri.app", // URL publique (balise canonical / OG)
  },

  // ── Contact & réservation ───────────────────────────────────
  contact: {
    email: "wael.benhallam@gmail.com",
    emailSubject: "Demande de diagnostic IA",
  },

  booking: {
    // Lien Cal.com de l'appel de diagnostic (15 min)
    calLink: "https://cal.com/wael-benhallam/15min",

    // Optionnel : un événement Cal.com dédié par pack.
    // Laisser vide ("") pour réutiliser calLink avec le pack pré-rempli dans les notes.
    packLinks: {
      "pack-01": "",
      "pack-02": "",
      "pack-03": "",
    },
  },

  // ── Newsletter (Brevo / Substack / Tally / Mailchimp…) ──────
  newsletter: {
    // URL "action" du formulaire fourni par votre outil.
    // Tant que la valeur contient "VOTRE_", le formulaire fonctionne en mode démo.
    action: "https://buttondown.com/api/emails/embed-subscribe/benhallam",
    method: "POST",
    emailField: "email",         // Buttondown : "email" · Brevo : "EMAIL" · Mailchimp : "EMAIL"
    extraFields: { embed: "1" }, // champ caché attendu par le formulaire intégré Buttondown
  },

  // ── Mentions légales (LCEN, art. 6-III) ─────────────────────
  legal: {
    legalName: "Wael Benhallam",
    status: "Entrepreneur individuel (micro-entreprise)",
    address: "Paris, France", // adresse de domiciliation complète recommandée
    siret: "935 246 801 00010",
    vat: "TVA non applicable, art. 293 B du CGI",
    publicationDirector: "Wael Benhallam",
    host: {
      name: "Vercel Inc.",
      address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
      website: "https://vercel.com",
    },
  },
};
