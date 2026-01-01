import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const PAGES = ['/', '/alerts', '/hospitals', '/login'];
const OUT_DIR = path.resolve(new URL('.', import.meta.url).pathname, '../screenshots');

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  for (const p of PAGES) {
    const url = `http://localhost:5173${p}`;
    console.log('Navigating to', url);
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle' , timeout: 15000});
      if (!resp || !resp.ok()) {
        console.warn('Non-OK response at', url, resp && resp.status());
      }
      // Wait small delay for client rendering
      await page.waitForTimeout(800);
      const name = p === '/' ? 'index' : p.replace(/\//g, '_').replace(/^_/, '');
      const file = path.join(OUT_DIR, `${name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log('Saved', file);
    } catch (err) {
      console.error('Failed to capture', url, err.message);
    }
  }

  await browser.close();
})();