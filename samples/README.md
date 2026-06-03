# Échantillons de calibration

Dépose ici tes bordereaux PDF (non versionnés) :

- `vinted-go.pdf` — premier à calibrer
- `mondial-relay.pdf`, `chronopost.pdf`, `colissimo.pdf` — ensuite

```bash
node scripts/pdf-info.js samples/vinted-go.pdf
node scripts/preview.js samples/vinted-go.pdf vinted-go "Mon article test"
open samples/vinted-go-preview.pdf
```

Puis ajuste `src/config/transporteurs.js` et relance `preview.js`.
