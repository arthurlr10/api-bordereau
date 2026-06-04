import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { processPdf } from '../src/services/processPdf.js';
import { TRANSPORTEURS_VALIDES } from '../src/config/transporteurs.js';
import { detectMondialRelayVariant } from '../src/services/detectMondialRelay.js';

const [inputPath, transporteur, article = 'TEST CALIBRATION', variantArg] = process.argv.slice(2);

if (!inputPath || !transporteur) {
  console.error(
    'Usage: node scripts/preview.js <fichier.pdf> <transporteur> [article] [variant]',
  );
  process.exit(1);
}

if (!TRANSPORTEURS_VALIDES.includes(transporteur)) {
  console.error(`Transporteur invalide. Valeurs: ${TRANSPORTEURS_VALIDES.join(', ')}`);
  process.exit(1);
}

const buffer = fs.readFileSync(inputPath);
const samplesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'samples');

if (transporteur === 'mondial-relay' && !variantArg) {
  const detected = await detectMondialRelayVariant(buffer);
  console.log(`Variant détecté: ${detected}`);
}

const variantOpt =
  variantArg != null && String(variantArg).trim() !== '' ? String(variantArg).trim() : undefined;

const baseName = path.basename(inputPath, path.extname(inputPath));
const suffix =
  transporteur === 'mondial-relay'
    ? `-${variantOpt ?? (await detectMondialRelayVariant(buffer))}`
    : '';
const outPath = path.resolve(samplesDir, `${baseName}-preview${suffix}.pdf`);

fs.mkdirSync(samplesDir, { recursive: true });
const result = await processPdf(buffer, transporteur, article, { variant: variantOpt });
fs.writeFileSync(outPath, result.bytes);

if (result.mondialVariant) {
  console.log(`Variant utilisé: ${result.mondialVariant}`);
}
console.log(`Écrit: ${outPath}`);
