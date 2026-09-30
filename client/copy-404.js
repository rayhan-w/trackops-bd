import fs from 'node:fs';

if (fs.existsSync('dist/index.html')) {
  fs.copyFileSync('dist/index.html', 'dist/404.html');
  console.log('[Build] Generated dist/404.html for SPA routing');
}
