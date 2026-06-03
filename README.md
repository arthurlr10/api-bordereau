# API bordereau PDF

API REST légère (Node.js + Express + pdf-lib) pour recadrer des bordereaux d'expédition, y ajouter le nom de l'article vendu, et fusionner plusieurs PDFs. Tout le traitement se fait en mémoire (pas de fichiers temporaires sur disque).

## Prérequis

- Node.js 18+

## Installation

```bash
npm install
npm start
```

Développement avec rechargement automatique :

```bash
npm run dev
```

Le serveur écoute sur `http://0.0.0.0:3000` (prêt pour un proxy Nginx sur conteneur LXC).

## Santé

```bash
curl http://localhost:3000/health
```

Réponse : `{ "ok": true }`

## POST `/process`

Traite un bordereau PDF : crop selon le transporteur, puis ajout du nom de l'article.

| Champ | Type | Description |
|-------|------|-------------|
| `pdf` | fichier | PDF binaire (`multipart/form-data`) |
| `transporteur` | string | `vinted-go`, `mondial-relay`, `chronopost`, `colissimo` |
| `article` | string | Nom de l'article vendu |

Réponse : PDF binaire (`Content-Type: application/pdf`).

Erreurs : JSON `{ "error": "..." }` avec code `400` ou `500`.

```bash
curl -X POST http://localhost:3000/process \
  -F "pdf=@bordereau.pdf" \
  -F "transporteur=vinted-go" \
  -F "article=Jean Levi's 32" \
  -o sortie.pdf
```

Seule la **première page** du PDF est traitée (cas standard d'un bordereau une page).

## POST `/merge`

Fusionne plusieurs PDFs dans l'ordre du tableau.

Body JSON :

```json
{
  "files": ["<base64>", "<base64>"]
}
```

Réponse : PDF fusionné en binaire.

```bash
curl -X POST http://localhost:3000/merge \
  -H "Content-Type: application/json" \
  -d "{\"files\":[\"$(base64 -i a.pdf | tr -d '\n')\",\"$(base64 -i b.pdf | tr -d '\n')\"]}" \
  -o fusion.pdf
```

Limite body JSON : 50 Mo. Limite upload `/process` : 10 Mo par fichier.

## Calibration des transporteurs

Les coordonnées de crop et de texte sont centralisées dans [`src/config/transporteurs.js`](src/config/transporteurs.js). C'est le seul fichier à modifier lors des tests avec de vrais bordereaux.

- **crop** : fractions `0` à `1` (`left`, `bottom`, `right`, `top`) = zone conservée sur la page source.
- **texte** : `x`, `y` en points PDF depuis le **bas-gauche de la page de sortie**, `size` optionnel.
- Pas d’étirement : la page de sortie a la taille de la zone cropée. Pour du **4×6** (288×432 pt), calibrer `crop` sur le PDF source.

Place les PDFs de test dans `samples/` (ex. `samples/vinted-go.pdf`, ignorés par git). Scripts :

```bash
node scripts/pdf-info.js samples/vinted-go.pdf
node scripts/preview.js samples/vinted-go.pdf vinted-go "TEST CALIBRATION"
```

Les valeurs actuelles sont des placeholders ; calibrer transporteur par transporteur.

Après modification de `transporteurs.js`, redémarrer `npm run dev` avant un `curl`. Si `sortie.pdf` est blanc ou faux, un **ancien** processus peut encore écouter sur le port 3000 : `lsof -i :3000` puis `kill <PID>`.

Sans serveur (même rendu que l’API à jour) :

```bash
npm run process:local
open samples/vinted-go-preview.pdf
```

## Structure

```
src/
├── index.js
├── config/transporteurs.js
├── services/
│   ├── processPdf.js
│   └── mergePdf.js
└── routes/
    ├── process.js
    └── merge.js
scripts/
├── pdf-info.js
└── preview.js
samples/          # PDFs de test locaux (gitignored)
```
