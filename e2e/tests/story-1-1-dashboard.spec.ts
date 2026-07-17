import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Story 1.1: Project Scaffolding - Angular Dashboard (ATDD)', () => {
  test('[P0] AC1: Angular dashboard app boots on localhost with placeholder home route', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.locator('osef-root')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('[P0] AC9: Dashboard connects to emulators in development mode', async () => {
    const configPath = path.join(process.cwd(), 'src', 'shared', 'firebase-config.ts');
    expect(fs.existsSync(configPath)).toBeTruthy();

    const content = fs.readFileSync(configPath, 'utf-8');
    expect(content).toContain('connectToEmulators');
    expect(content).toContain('connectFirestoreEmulator');
    expect(content).toContain('connectAuthEmulator');
  });
});
