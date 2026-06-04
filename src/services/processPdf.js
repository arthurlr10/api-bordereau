import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import { getTransporteurConfig } from '../config/transporteurs.js';
import { resolveMondialRelayVariant } from './detectMondialRelay.js';

/**
 * Applique crop et texte article sur la première page du PDF.
 * Produit une page cropW×cropH avec origine (0,0) pour un affichage fiable.
 * @param {Buffer} buffer
 * @param {string} transporteur
 * @param {string} article
 * @param {{ variant?: string }} [options]
 * @returns {Promise<{ bytes: Uint8Array, mondialVariant?: string }>}
 */
export async function processPdf(buffer, transporteur, article, options = {}) {
  let mondialVariant;
  let config;

  if (transporteur === 'mondial-relay') {
    const resolved = await resolveMondialRelayVariant(buffer, options.variant);
    mondialVariant = resolved.variant;
    config = getTransporteurConfig(transporteur, mondialVariant);
    if (!config) {
      throw new Error(`Configuration manquante pour variant ${mondialVariant}`);
    }
  } else {
    config = getTransporteurConfig(transporteur);
    if (!config) {
      throw new Error(`Transporteur inconnu : ${transporteur}`);
    }
  }

  const sourceDoc = await PDFDocument.load(buffer);
  const pages = sourceDoc.getPages();

  if (pages.length === 0) {
    throw new Error('PDF sans page');
  }

  const sourcePage = pages[0];
  const { width, height } = sourcePage.getSize();
  const { crop, texte, rotation = 0 } = config;

  const cropX = width * crop.left;
  const cropY = height * crop.bottom;
  const cropW = width * (crop.right - crop.left);
  const cropH = height * (crop.top - crop.bottom);

  if (cropW <= 0 || cropH <= 0) {
    throw new Error('Zone de crop invalide');
  }

  const outDoc = await PDFDocument.create();
  const rot = Number(rotation) || 0;
  const swap = rot === 90 || rot === -90;
  const outPage = outDoc.addPage(swap ? [cropH, cropW] : [cropW, cropH]);

  const embeddedPage = await outDoc.embedPage(sourcePage, {
    left: cropX,
    bottom: cropY,
    right: cropX + cropW,
    top: cropY + cropH,
  });

  if (rot === -90) {
    outPage.drawPage(embeddedPage, {
      x: 0,
      y: cropW,
      width: cropW,
      height: cropH,
      rotate: degrees(-90),
    });
  } else if (rot === 90) {
    outPage.drawPage(embeddedPage, {
      x: cropH,
      y: 0,
      width: cropW,
      height: cropH,
      rotate: degrees(90),
    });
  } else if (rot !== 0) {
    throw new Error(`Rotation non supportée : ${rot} (90 ou -90 uniquement)`);
  } else {
    outPage.drawPage(embeddedPage, { x: 0, y: 0, width: cropW, height: cropH });
  }

  const font = await outDoc.embedFont(StandardFonts.Helvetica);
  outPage.drawText(article, {
    x: texte.x,
    y: texte.y,
    size: texte.size ?? 10,
    font,
    color: rgb(0, 0, 0),
  });

  const bytes = await outDoc.save();
  return mondialVariant != null ? { bytes, mondialVariant } : { bytes };
}
