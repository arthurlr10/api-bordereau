import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { processPdf } from '../src/services/processPdf.js';
import { TRANSPORTEURS_VALIDES } from '../src/config/transporteurs.js';

const [inputPath, transporteur, article = 'TEST CALIBRATION'] = process.argv.slice(2);

if (!inputPath || !transporteur) {
  console.error('Usage: node scripts/preview.js <fichier.pdf> <transporteur> [article]');
  process.exit(1);
}

if (!TRANSPORTEURS_VALIDES.includes(transporteur)) {
  console.error(`Transporteur invalide. Valeurs: ${TRANSPORTEURS_VALIDES.join(', ')}`);
  process.exit(1);
}

const buffer = fs.readFileSync(inputPath);
const samplesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'samples');
const outPath = path.resolve(samplesDir, `${transporteur}-preview.pdf`);

fs.mkdirSync(samplesDir, { recursive: true });
const pdfBytes = await processPdf(buffer, transporteur, article);
fs.writeFileSync(outPath, pdfBytes);
console.log(`Écrit: ${outPath}`);
