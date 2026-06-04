import { PDFDocument } from 'pdf-lib';

export const MONDIAL_RELAY_VARIANTS = ['native', 'fpdf', 'pdflib'];

const FPDF_SIZE_THRESHOLD = 80_000;

/**
 * Détecte le variant Mondial Relay à partir du PDF (métadonnées + taille).
 * @param {Buffer} buffer
 * @param {PDFDocument} [doc] document déjà chargé (évite double load)
 * @returns {Promise<'native'|'fpdf'|'pdflib'>}
 */
export async function detectMondialRelayVariant(buffer, doc) {
  const pdfDoc = doc ?? (await PDFDocument.load(buffer));
  const creator = (pdfDoc.getCreator() ?? '').toString();
  const producer = (pdfDoc.getProducer() ?? '').toString();

  if (creator.includes('MondialRelay')) {
    return 'native';
  }
  if (producer.includes('FPDF') || buffer.byteLength > FPDF_SIZE_THRESHOLD) {
    return 'fpdf';
  }
  return 'pdflib';
}

/**
 * Résout le variant : override optionnel ou détection auto.
 * @param {Buffer} buffer
 * @param {string} [variantOverride]
 * @returns {Promise<{ variant: string, doc: PDFDocument }>}
 */
export async function resolveMondialRelayVariant(buffer, variantOverride) {
  const doc = await PDFDocument.load(buffer);

  if (variantOverride != null && variantOverride !== '') {
    const forced = String(variantOverride).trim();
    if (!MONDIAL_RELAY_VARIANTS.includes(forced)) {
      const err = new Error(
        `Variant Mondial Relay invalide. Valeurs acceptées : ${MONDIAL_RELAY_VARIANTS.join(', ')}`,
      );
      err.code = 'INVALID_VARIANT';
      throw err;
    }
    return { variant: forced, doc };
  }

  const variant = await detectMondialRelayVariant(buffer, doc);
  return { variant, doc };
}
