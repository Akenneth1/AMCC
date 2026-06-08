#!/usr/bin/env node
// build-inject.js — Injecte les pages HTML dans index.html avant le build Vite
// Résout définitivement le problème fetch sur GitHub Pages

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pages = [
  'accueil','association','festival','evenements','galerie',
  'rejoindre','partenaires','don','paiement','contact',
  'mentions','confidentialite','admin-login','admin'
];

// Lire index.html
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');

// Construire le bloc de toutes les pages
let pagesBlock = '';
for (const page of pages) {
  const filePath = path.join(__dirname, 'src', 'pages', `${page}.html`);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠ Page manquante: ${page}.html`);
    pagesBlock += `<div id="page-${page}" class="page"></div>\n  `;
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf-8');
  const isActive = page === 'accueil' ? ' active' : '';
  pagesBlock += `<div id="page-${page}" class="page${isActive}">${content}</div>\n  `;
  console.log(`✓ ${page}.html injecté`);
}

// Remplacer le placeholder <main id="app"></main>
if (!html.includes('<main id="app"></main>')) {
  console.error('❌ Placeholder <main id="app"></main> introuvable dans index.html');
  process.exit(1);
}
html = html.replace('<main id="app"></main>', `<main id="app">\n  ${pagesBlock}</main>`);

// Écrire index.built.html (Vite va le builder)
fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf-8');
console.log('✅ index.html mis à jour avec toutes les pages injectées');
