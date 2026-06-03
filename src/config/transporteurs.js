/**
 * crop : fractions 0–1 sur la page source (zone conservée).
 * texte : x, y en points depuis le bas-gauche de la zone recadrée (pas la page entière).
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
