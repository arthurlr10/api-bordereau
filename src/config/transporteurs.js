/**
 * crop : fractions 0–1 sur la page source (zone conservée = étiquette).
 * Pas d’étirement : la sortie = taille de la zone cropée.
 * texte : x, y en points depuis le bas-gauche de la page de sortie.
 * rotation : optionnel, 90 ou -90 en degrés après crop (pdflib : 90).
 *
 * mondial-relay : variants (native | fpdf | pdflib), détection auto dans detectMondialRelay.js
 */
export const transporteurs = {
  'vinted-go': {
    // Calibré — étiquette 4×6 en haut-gauche sur A4, sans étirement
    crop: { left: 0.012, bottom: 0.505, right: 0.488, top: 1 },
    texte: { x: 8, y: 3, size: 9 },
  },
  'mondial-relay': {
    variants: {
      // MondialRelay 3.x / PDFsharp — étiquette haut-gauche A4, calibré depuis p1
      native: {
        crop: { left: 0.036, bottom: 0.478, right: 0.512, top: 0.968 },
        texte: { x: 8, y: 3, size: 9 },
      },
      // FPDF raster pleine page (~571×808 pt)
      fpdf: {
        crop: { left: 0.02, bottom: 0.02, right: 0.98, top: 0.98 },
        texte: { x: 8, y: 3, size: 9 },
      },
      // pdf-lib — moitié basse A4, rotation 90° ; tourné : haut/bas = top/bottom, gauche/droite = left/right
      pdflib: {
        crop: { left: 0.12, bottom: 0.05, right: 0.85, top: 0.38 },
        rotation: 90,
        texte: { x: 8, y: 3, size: 9 },
      },
    },
  },
  chronopost: {
    // A4 paysage — étiquette moitié droite, calibré (~346×488 pt)
    crop: { left: 0.59, bottom: 0.13, right: 1, top: 0.95 },
    texte: { x: 8, y: 3, size: 9 },
  },
  colissimo: {
    crop: { left: 0.5, bottom: 0.5, right: 1, top: 1 },
    texte: { x: 10, y: 10, size: 10 },
  },
};

export const TRANSPORTEURS_VALIDES = Object.keys(transporteurs);

export function getTransporteurConfig(transporteur, mondialVariant) {
  const entry = transporteurs[transporteur];
  if (!entry) return null;
  if (transporteur === 'mondial-relay') {
    return entry.variants[mondialVariant] ?? null;
  }
  return entry;
}
