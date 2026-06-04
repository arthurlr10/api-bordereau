# Échantillons de calibration

Dépose ici tes bordereaux PDF (non versionnés) :

- `vinted-go.pdf` — calibré
- `chronopost.pdf` — calibré
- `mondial-relay-native.pdf` — Mondial Relay officiel (Creator `MondialRelay`)
- `mondial-relay-fpdf.pdf` — Mondial Relay raster / FPDF
- `mondial-relay-pdflib.pdf` — Mondial Relay compact (pdf-lib)
- `colissimo.pdf` — à calibrer

```bash
node scripts/pdf-info.js samples/vinted-go.pdf
node scripts/preview.js samples/vinted-go.pdf vinted-go "Mon article test"

# Mondial Relay — détection auto du variant
node scripts/preview.js samples/mondial-relay-native.pdf mondial-relay "TEST"
node scripts/preview.js samples/mondial-relay-native.pdf mondial-relay "TEST" native

# Presets de crop pour un variant
node scripts/try-crops-mondial.js samples/mondial-relay-fpdf.pdf fpdf
```

Puis ajuste `src/config/transporteurs.js` et relance `preview.js`.
