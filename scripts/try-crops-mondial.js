import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';
import { processPdf } from '../src/services/processPdf.js';
import { transporteurs } from '../src/config/transporteurs.js';
import { detectMondialRelayVariant } from '../src/services/detectMondialRelay.js';

const input = process.argv[2];
const variantArg = process.argv[3];

if (!input) {
  console.error('Usage: node scripts/try-crops-mondial.js <fichier.pdf> [variant]');
  process.exit(1);
}

const buffer = fs.readFileSync(input);
const variant = variantArg ?? (await detectMondialRelayVariant(buffer));
console.log('Variant:', variant);

const presets = [
  { name: 'p1', crop: { left: 0.012, bottom: 0.505, right: 0.488, top: 1 } },
  { name: 'p2', crop: { left: 0.02, bottom: 0.02, right: 0.98, top: 0.98 } },
  { name: 'p3', crop: { left: 0.05, bottom: 0.45, right: 0.55, top: 1 } },
  { name: 'p4', crop: { left: 0.0, bottom: 0.48, right: 0.5, top: 1 } },
  { name: 'p5', crop: { left: 0.01, bottom: 0.52, right: 0.49, top: 1 } },
];

const samplesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'samples');
const saved = transporteurs['mondial-relay'].variants[variant];

for (const p of presets) {
  transporteurs['mondial-relay'].variants[variant] = {
    ...saved,
    crop: p.crop,
    texte: saved.texte,
  };
  const { bytes } = await processPdf(buffer, 'mondial-relay', 'ARTICLE TEST', { variant });
  const out = path.join(samplesDir, `mondial-${variant}-crop-${p.name}.pdf`);
  fs.writeFileSync(out, bytes);
  const s = (await PDFDocument.load(bytes)).getPage(0).getSize();
  console.log(p.name, p.crop, '->', `${s.width.toFixed(0)}x${s.height.toFixed(0)} pt`);
}

transporteurs['mondial-relay'].variants[variant] = saved;
