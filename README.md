# bistouri.app

Site vitrine statique : automatisation IA pour cabinets, établissements et PME.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Page unique (SEO, OpenGraph, données structurées) |
| `config.js` | **Toutes les valeurs modifiables** : marque, email, Cal.com, newsletter Buttondown, mentions légales |
| `styles.css` | Styles du site |
| `tailwind.css` | CSS Tailwind compilé et minifié (généré, ne pas éditer) |
| `src/tailwind.css` | Source Tailwind (thème + fichiers analysés) |
| `app.js` | Interactions : modales, réservation par pack, newsletter, menu mobile |

## Compiler le CSS

Après toute modification de classes Tailwind dans `index.html` ou `app.js` :

```bash
npm install
npm run build
```

`tailwind.css` est versionné : le site reste déployable par simple glisser-déposer, sans étape de build.

## Déploiement (Vercel)

Importer le dépôt, preset **Other**. Vercel exécute `npm run build` puis sert la racine du projet.
