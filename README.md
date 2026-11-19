# bistouri.app

Site vitrine statique : Radar des marchés publics arrivant à échéance (DECP).

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Page unique du Radar (promesse, échantillon, offres Stripe, mentions légales) |
| `radar.js` | Interactions : menu mobile, aperçu gratuit secteur × région, choix transmis à Stripe (`client_reference_id`), mentions légales |
| `merci.html` | Confirmation de commande (`/merci`), à régler comme redirection après paiement dans les deux liens Stripe |
| `echantillon_gratuit_radar.xlsx` | Échantillon gratuit de 50 marchés, servi à la racine |
| `config.js` | **Toutes les valeurs modifiables** : marque, email, Cal.com, newsletter Buttondown, mentions légales |
| `styles.css` | Styles du site |
| `tailwind.css` | CSS Tailwind compilé et minifié (généré, ne pas éditer) |
| `src/tailwind.css` | Source Tailwind (thème + fichiers analysés) |
| `app.js`, `config.js` | Ancienne page de prestations IA, plus chargée par `index.html` |

## Compiler le CSS

Après toute modification de classes Tailwind dans `index.html` ou `app.js` :

```bash
npm install
npm run build
```

`tailwind.css` est versionné : le site reste déployable par simple glisser-déposer, sans étape de build.

## Déploiement (Vercel)

Importer le dépôt, preset **Other**. Vercel exécute `npm run build` puis sert la racine du projet.
