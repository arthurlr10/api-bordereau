import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { transporteurs } from '../config/transporteurs.js';

/**
 * Applique crop et texte article sur la première page du PDF.
 * Produit une page cropW×cropH avec origine (0,0) pour un affichage fiable.
 * @param {Buffer} buffer
 * @param {string} transporteur
 * @param {string} article
 * @returns {Promise<Uint8Array>}
 */
export async function processPdf(buffer, transporteur, article) {
  const config = transporteurs[transporteur];
  const sourceDoc = await PDFDocument.load(buffer);
  const pages = sourceDoc.getPages();

  if (pages.length === 0) {
    throw new Error('PDF sans page');
  }

  const sourcePage = pages[0];
  const { width, height } = sourcePage.getSize();
  const { crop, texte } = config;

  const cropX = width * crop.left;
  const cropY = height * crop.bottom;
  const cropW = width * (crop.right - crop.left);
  const cropH = height * (crop.top - crop.bottom);

  if (cropW <= 0 || cropH <= 0) {
    throw new Error('Zone de crop invalide');
  }

  const outDoc = await PDFDocument.create();
  const outPage = outDoc.addPage([cropW, cropH]);

  const embeddedPage = await outDoc.embedPage(sourcePage, {
    left: cropX,
    bottom: cropY,
    right: cropX + cropW,
    top: cropY + cropH,
  });

  outPage.drawPage(embeddedPage, { x: 0, y: 0, width: cropW, height: cropH });

  const font = await outDoc.embedFont(StandardFonts.Helvetica);
  outPage.drawText(article, {
    x: texte.x,
    y: texte.y,
    size: texte.size ?? 10,
    font,
    color: rgb(0, 0, 0),
  });

  return outDoc.save();
}
