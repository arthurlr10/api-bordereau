import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { transporteurs } from '../config/transporteurs.js';

/**
 * Applique crop et texte article sur la première page du PDF.
 * @param {Buffer} buffer
 * @param {string} transporteur
 * @param {string} article
 * @returns {Promise<Uint8Array>}
 */
export async function processPdf(buffer, transporteur, article) {
  const config = transporteurs[transporteur];
  const pdfDoc = await PDFDocument.load(buffer);
  const pages = pdfDoc.getPages();

  if (pages.length === 0) {
    throw new Error('PDF sans page');
  }

  const page = pages[0];
  const { width, height } = page.getSize();
  const { crop, texte } = config;

  const cropX = width * crop.left;
  const cropY = height * crop.bottom;
  const cropW = width * (crop.right - crop.left);
  const cropH = height * (crop.top - crop.bottom);

  if (cropW <= 0 || cropH <= 0) {
    throw new Error('Zone de crop invalide');
  }

  page.setCropBox(cropX, cropY, cropW, cropH);
  page.setMediaBox(cropX, cropY, cropW, cropH);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  // texte.x / texte.y : points depuis le bas-gauche de la zone recadrée
  page.drawText(article, {
    x: cropX + texte.x,
    y: cropY + texte.y,
    size: texte.size ?? 10,
    font,
    color: rgb(0, 0, 0),
  });

  return pdfDoc.save();
}
