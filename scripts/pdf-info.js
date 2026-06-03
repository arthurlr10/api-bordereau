import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

const path = process.argv[2];
if (!path) {
  console.error('Usage: node scripts/pdf-info.js <fichier.pdf>');
  process.exit(1);
}

const buffer = fs.readFileSync(path);
const doc = await PDFDocument.load(buffer);
const page = doc.getPage(0);
const { width, height } = page.getSize();
const rotation = page.getRotation().angle;

console.log(`Fichier: ${path}`);
console.log(`Pages: ${doc.getPageCount()}`);
console.log(`Page 1: ${width.toFixed(2)} x ${height.toFixed(2)} pt`);
if (rotation) console.log(`Rotation: ${rotation}°`);
