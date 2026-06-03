import express from 'express';
import multer from 'multer';
import processRouter from './routes/process.js';
import mergeRouter from './routes/merge.js';

const PORT = Number(process.env.PORT) || 3001;
const app = express();

app.use(express.json({ limit: '50mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/process', upload.single('pdf'), processRouter);
app.use('/merge', mergeRouter);

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Fichier PDF trop volumineux (max 10 Mo)' });
    }
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API bordereau écoute sur http://0.0.0.0:${PORT}`);
});
