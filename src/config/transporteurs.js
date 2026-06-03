/**
 * crop : fractions 0–1 sur la page source (zone conservée = étiquette, ex. 4×6 en haut-gauche d’un A4).
 * Pas d’étirement : ajuster left/right/top/bottom pour que la zone cropée fasse ~288×432 pt (4×6).
 * texte : x, y en points depuis le bas-gauche de la page de sortie.
 */
export const transporteurs = {
  'vinted-go': {
    // Calibré — étiquette 4×6 en haut-gauche sur A4, sans étirement
    crop: { left: 0.012, bottom: 0.505, right: 0.488, top: 1 },
    texte: { x: 8, y: 3, size: 9 },
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
