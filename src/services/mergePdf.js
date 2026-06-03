import { PDFDocument } from 'pdf-lib';

/**
 * Fusionne plusieurs PDFs (Buffers) dans l'ordre donné.
 * @param {Buffer[]} buffers
 * @returns {Promise<Uint8Array>}
 */
export async function mergePdf(buffers) {
  const merged = await PDFDocument.create();

  for (const buffer of buffers) {
    const source = await PDFDocument.load(buffer);
    const pages = await merged.copyPages(source, source.getPageIndices());
    for (const page of pages) {
      merged.addPage(page);
    }
  }

  return merged.save();
}
