import { Router } from 'express';
import { TRANSPORTEURS_VALIDES } from '../config/transporteurs.js';
import { processPdf } from '../services/processPdf.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Champ "pdf" requis (fichier multipart)' });
    }

    const { transporteur, article } = req.body;

    if (!transporteur || typeof transporteur !== 'string') {
      return res.status(400).json({ error: 'Champ "transporteur" requis' });
    }

    if (!TRANSPORTEURS_VALIDES.includes(transporteur)) {
      return res.status(400).json({
        error: `Transporteur invalide. Valeurs acceptées : ${TRANSPORTEURS_VALIDES.join(', ')}`,
      });
    }

    if (!article || typeof article !== 'string' || article.trim().length === 0) {
      return res.status(400).json({ error: 'Champ "article" requis (nom de l\'article vendu)' });
    }

    const pdfBytes = await processPdf(req.file.buffer, transporteur, article.trim());
    res.set('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    if (
      err.message === 'PDF sans page' ||
      err.message === 'Zone de crop invalide' ||
      err.name === 'InvalidPDFException'
    ) {
      return res.status(400).json({ error: err.message || 'PDF invalide ou illisible' });
    }
    next(err);
  }
});

export default router;
