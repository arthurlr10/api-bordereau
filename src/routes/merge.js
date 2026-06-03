import { Router } from 'express';
import { mergePdf } from '../services/mergePdf.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { files } = req.body;

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Le champ "files" doit être un tableau non vide de PDFs en base64' });
    }

    const buffers = [];

    for (let i = 0; i < files.length; i++) {
      const entry = files[i];
      if (typeof entry !== 'string' || entry.length === 0) {
        return res.status(400).json({ error: `Entrée invalide à l'index ${i}` });
      }

      const base64 = entry.replace(/^data:application\/pdf;base64,/, '');
      let buffer;
      try {
        buffer = Buffer.from(base64, 'base64');
      } catch {
        return res.status(400).json({ error: `Base64 invalide à l'index ${i}` });
      }

      if (buffer.length === 0) {
        return res.status(400).json({ error: `PDF vide à l'index ${i}` });
      }

      buffers.push(buffer);
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
