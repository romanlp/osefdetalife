import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Widget Embed', () => {
  test('[P0] should build widget to dist/widget/', async () => {
    const distPath = path.join(process.cwd(), 'dist', 'widget');
    expect(fs.existsSync(distPath)).toBeTruthy();
  });

  test('[P0] should produce a .mjs bundle', async () => {
    const distPath = path.join(process.cwd(), 'dist', 'widget');
    const files = fs.readdirSync(distPath);
    const mjsFiles = files.filter((f) => f.endsWith('.mjs'));
    expect(mjsFiles.length).toBeGreaterThan(0);
  });

  test('[P0] widget bundle should be loadable', async ({ page }) => {
    const distPath = path.join(process.cwd(), 'dist', 'widget');
    const files = fs.readdirSync(distPath);
    const mjsFile = files.find((f) => f.endsWith('.mjs'));
    expect(mjsFile).toBeTruthy();

    await page.goto('about:blank');
    await page.addScriptTag({
      path: path.join(distPath, mjsFile!),
    });

    const hasCustomElement = await page.evaluate(() => {
      return customElements.get('booking-widget') !== undefined;
    });
    expect(hasCustomElement).toBeTruthy();
  });

  test('[P0] widget should render booking-widget element', async ({ page }) => {
    const distPath = path.join(process.cwd(), 'dist', 'widget');
    const files = fs.readdirSync(distPath);
    const mjsFile = files.find((f) => f.endsWith('.mjs'));
    expect(mjsFile).toBeTruthy();

    await page.goto('about:blank');
    await page.addScriptTag({
      path: path.join(distPath, mjsFile!),
    });

    await page.setContent(`
      <html>
        <body>
          <booking-widget restaurant="test-restaurant"></booking-widget>
        </body>
      </html>
    `);

    const widget = page.locator('booking-widget');
    await expect(widget).toBeAttached();
  });
});
