import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const distPath = path.join(process.cwd(), 'dist', 'widget');

function getMjsContent(): string {
  const files = fs.readdirSync(distPath);
  const mjsFile = files.find((f) => f.endsWith('.mjs'));
  if (!mjsFile) throw new Error('No .mjs file found in dist/widget/');
  return fs.readFileSync(path.join(distPath, mjsFile), 'utf-8');
}

test.describe('Widget Embed', () => {
  test('[P0] should build widget to dist/widget/', async () => {
    expect(fs.existsSync(distPath)).toBeTruthy();
  });

  test('[P0] should produce a .mjs bundle', async () => {
    const files = fs.readdirSync(distPath);
    const mjsFiles = files.filter((f) => f.endsWith('.mjs'));
    expect(mjsFiles.length).toBeGreaterThan(0);
  });

  test('[P0] widget bundle should be loadable', async ({ page }) => {
    const mjsContent = getMjsContent();

    await page.route('http://localhost/test', async (route) => {
      await route.fulfill({
        contentType: 'text/html',
        body: `<!DOCTYPE html><html><body>
          <script type="module">await import('/booking-widget.mjs'); window.__widgetLoaded = true;<\/script>
        </body></html>`,
      });
    });

    await page.route('http://localhost/booking-widget.mjs', async (route) => {
      await route.fulfill({
        contentType: 'application/javascript; charset=utf-8',
        body: mjsContent,
      });
    });

    await page.goto('http://localhost/test');
    await page.waitForFunction(() => (window as any).__widgetLoaded === true);

    const hasCustomElement = await page.evaluate(() => {
      return customElements.get('booking-widget') !== undefined;
    });
    expect(hasCustomElement).toBeTruthy();
  });

  test('[P0] widget should render booking-widget element', async ({ page }) => {
    const mjsContent = getMjsContent();

    await page.route('http://localhost/test', async (route) => {
      await route.fulfill({
        contentType: 'text/html',
        body: `<!DOCTYPE html><html><body>
          <booking-widget restaurant="test-restaurant"></booking-widget>
          <script type="module">await import('/booking-widget.mjs'); window.__widgetLoaded = true;<\/script>
        </body></html>`,
      });
    });

    await page.route('http://localhost/booking-widget.mjs', async (route) => {
      await route.fulfill({
        contentType: 'application/javascript; charset=utf-8',
        body: mjsContent,
      });
    });

    await page.goto('http://localhost/test');
    await page.waitForFunction(() => (window as any).__widgetLoaded === true);

    const widget = page.locator('booking-widget');
    await expect(widget).toBeAttached();
  });
});
