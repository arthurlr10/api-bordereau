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

Le serveur écoute sur `http://0.0.0.0:3001` par défaut (`PORT` configurable, ex. `PORT=3001 npm start`). Prêt pour un proxy Nginx sur conteneur LXC — le port 3000 est souvent déjà utilisé par un front Next.js.

## Santé

```bash
curl http://localhost:3001/health
```

Réponse : `{ "ok": true }`

## POST `/process`

Traite un bordereau PDF : crop selon le transporteur, puis ajout du nom de l'article.

| Champ | Type | Description |
|-------|------|-------------|
| `pdf` | fichier | PDF binaire (`multipart/form-data`) |
| `transporteur` | string | `vinted-go`, `mondial-relay`, `chronopost`, `colissimo` |
| `article` | string | Nom de l'article vendu |
| `variant` | string | Optionnel, **mondial-relay** uniquement : `native`, `fpdf`, `pdflib` (sinon détection auto) |

Réponse : PDF binaire (`Content-Type: application/pdf`).

Pour **mondial-relay**, la réponse inclut l’en-tête `X-Mondial-Relay-Variant` (`native` | `fpdf` | `pdflib`) indiquant le format détecté ou forcé.

Erreurs : JSON `{ "error": "..." }` avec code `400` ou `500`.

```bash
curl -X POST http://localhost:3001/process \
  -F "pdf=@bordereau.pdf" \
  -F "transporteur=vinted-go" \
  -F "article=Jean Levi's 32" \
  -o sortie.pdf

# Mondial Relay — détection auto du variant
curl -X POST http://localhost:3001/process \
  -F "pdf=@samples/mondial-relay-native.pdf" \
  -F "transporteur=mondial-relay" \
  -F "article=Jean Levi's 32" \
  -D - -o sortie.pdf | grep -i X-Mondial

# Forcer un variant (debug)
curl -X POST http://localhost:3001/process \
  -F "pdf=@bordereau.pdf" \
  -F "transporteur=mondial-relay" \
  -F "variant=fpdf" \
  -F "article=Test" \
  -o sortie.pdf
```

Seule la **première page** du PDF est traitée (cas standard d'un bordereau une page).

## POST `/merge`

Fusionne des PDFs en base64. Ordre des pages : **file1** puis **file2** (ou ordre du tableau `files`).

Body JSON (recommandé pour n8n) :

```json
{
  "file1": "<base64 ancien PDF>",
  "file2": "<base64 nouveau PDF>"
}
```

`file1` et/ou `file2` : au moins un des deux est requis. Préfixe `data:application/pdf;base64,` accepté.

Forme alternative (tableau, rétrocompatible) :

```json
{
  "files": ["<base64>", "<base64>"]
}
```

Réponse : PDF fusionné en binaire.

```bash
curl -X POST http://localhost:3001/merge \
  -H "Content-Type: application/json" \
  -d "{\"file1\":\"$(base64 -i ancien.pdf | tr -d '\n')\",\"file2\":\"$(base64 -i nouveau.pdf | tr -d '\n')\"}" \
  -o fusion.pdf
```

Limite body JSON : 50 Mo. Limite upload `/process` : 10 Mo par fichier.

## Calibration des transporteurs

Les coordonnées de crop et de texte sont centralisées dans [`src/config/transporteurs.js`](src/config/transporteurs.js). C'est le seul fichier à modifier lors des tests avec de vrais bordereaux.

- **crop** : fractions `0` à `1` (`left`, `bottom`, `right`, `top`) = zone conservée sur la page source.
- **texte** : `x`, `y` en points PDF depuis le **bas-gauche de la page de sortie**, `size` optionnel.
- Pas d’étirement : la page de sortie a la taille de la zone cropée. Pour du **4×6** (288×432 pt), calibrer `crop` sur le PDF source.

### Mondial Relay (3 formats)

Détection automatique ([`src/services/detectMondialRelay.js`](src/services/detectMondialRelay.js)) :

| Variant | Empreinte | Crop calibré (sortie typique) |
|---------|-----------|-------------------------------|
| `native` | `Creator` contient `MondialRelay` | ~283×417 pt, haut-gauche A4 |
| `fpdf` | `Producer` FPDF ou PDF > 80 Ko | ~571×808 pt, quasi pleine page |
| `pdflib` | sinon (pdf-lib compact) | ~286×404 pt, haut-gauche |

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
│   ├── detectMondialRelay.js
│   └── mergePdf.js
└── routes/
    ├── process.js
    └── merge.js
scripts/
├── pdf-info.js
├── preview.js
├── try-crops.js
└── try-crops-mondial.js
samples/          # PDFs de test locaux (gitignored)
```
