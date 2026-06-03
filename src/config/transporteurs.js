/**
 * Coordonnées de crop (fractions 0–1) et position du texte (points PDF, origine bas-gauche).
 * À calibrer avec de vrais bordereaux pour chaque transporteur.
 */
export const transporteurs = {
  'vinted-go': {
    crop: { left: 0.5, bottom: 0.5, right: 1, top: 1 },
    texte: { x: 10, y: 10, size: 10 },
  },
  'mondial-relay': {
    crop: { left: 0.5, bottom: 0.5, right: 1, top: 1 },
    texte: { x: 10, y: 10, size: 10 },
  },
  chronopost: {
    crop: { left: 0.5, bottom: 0.5, right: 1, top: 1 },
    texte: { x: 10, y: 10, size: 10 },
  },
  colissimo: {
    crop: { left: 0.5, bottom: 0.5, right: 1, top: 1 },
    texte: { x: 10, y: 10, size: 10 },
  },
};

export const TRANSPORTEURS_VALIDES = Object.keys(transporteurs);
