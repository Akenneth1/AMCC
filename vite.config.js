import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PAGES = [
  'accueil','association','festival','evenements','galerie',
  'rejoindre','partenaires','don','paiement','contact',
  'mentions','confidentialite','admin-login','admin'
];

function injectPages() {
  return {
    name: 'inject-pages',
    transformIndexHtml(html) {
      if (!html.includes('<main id="app"></main>')) return html;
      let block = '';
      for (const page of PAGES) {
        const file = path.join(__dirname, 'src', 'pages', `${page}.html`);
        if (!fs.existsSync(file)) {
          console.warn(`⚠ Page manquante: ${page}.html`);
          block += `<div id="page-${page}" class="page"></div>\n  `;
          continue;
        }
        const content = fs.readFileSync(file, 'utf-8');
        block += `<div id="page-${page}" class="page${page === 'accueil' ? ' active' : ''}">${content}</div>\n  `;
      }
      return html.replace('<main id="app"></main>', `<main id="app">\n  ${block}</main>`);
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [injectPages()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: { input: { main: 'index.html' } }
  },
  server: { port: 5173, open: true }
});

