import fs from 'fs';
import { processPdf } from '../src/services/processPdf.js';
import { transporteurs } from '../src/config/transporteurs.js';

const input = process.argv[2] || 'samples/chronopost.pdf';
const buffer = fs.readFileSync(input);
const presets = [
  { name: 'c1', crop: { left: 0.5, right: 1, bottom: 0.27, top: 1 } },
  { name: 'c2', crop: { left: 0.58, right: 0.99, bottom: 0.28, top: 0.99 } },
  { name: 'c3', crop: { left: 0.52, right: 1, bottom: 0.22, top: 1 } },
  { name: 'c4', crop: { left: 0.655, right: 1, bottom: 0.274, top: 1 } },
  { name: 'd2', crop: { left: 0.658, right: 1, bottom: 0.18, top: 0.906 } },
  { name: 'd3', crop: { left: 0.658, right: 1, bottom: 0.15, top: 0.876 } },
];

const saved = transporteurs.chronopost;
for (const p of presets) {
  transporteurs.chronopost = { ...saved, crop: p.crop, texte: saved.texte };
  const { bytes } = await processPdf(buffer, 'chronopost', 'ARTICLE TEST');
  fs.writeFileSync(`samples/crop-${p.name}.pdf`, bytes);
  console.log(p.name, p.crop);
}
transporteurs.chronopost = saved;
