import { Router } from 'express';
import { mergePdf } from '../services/mergePdf.js';

const router = Router();

function decodeBase64Pdf(entry, label) {
  if (typeof entry !== 'string' || entry.length === 0) {
    throw new Error(`Champ "${label}" invalide ou vide`);
  }

  const base64 = entry.replace(/^data:application\/pdf;base64,/, '');
  let buffer;
  try {
    buffer = Buffer.from(base64, 'base64');
  } catch {
    throw new Error(`Base64 invalide pour "${label}"`);
  }

  if (buffer.length === 0) {
    throw new Error(`PDF vide pour "${label}"`);
  }

  return buffer;
}

/**
 * @param {Record<string, unknown>} body
 * @returns {{ entry: string, label: string }[]}
 */
function collectPdfEntries(body) {
  const { files, file1, file2 } = body;

  if (file1 != null || file2 != null) {
    const list = [];
    if (file1 != null) list.push({ entry: file1, label: 'file1' });
    if (file2 != null) list.push({ entry: file2, label: 'file2' });
    return list;
  }

  if (Array.isArray(files)) {
    return files.map((entry, i) => ({ entry, label: `files[${i}]` }));
  }

  return [];
}

router.post('/', async (req, res, next) => {
  try {
    const entries = collectPdfEntries(req.body);

    if (entries.length === 0) {
      return res.status(400).json({
        error:
          'Corps JSON requis : "file1" et/ou "file2" (base64), ou "files" (tableau de base64)',
      });
    }

    const buffers = [];
    for (const { entry, label } of entries) {
      try {
        buffers.push(decodeBase64Pdf(entry, label));
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }

    const pdfBytes = await mergePdf(buffers);
    res.set('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    if (err.message?.includes('PDF') || err.name === 'InvalidPDFException') {
      return res.status(400).json({ error: 'Un ou plusieurs PDFs sont invalides ou illisibles' });
    }
    next(err);
  }
});

export default router;
