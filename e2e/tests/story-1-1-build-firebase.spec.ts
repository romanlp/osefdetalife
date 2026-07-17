import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Story 1.1: Project Scaffolding - Build & Firebase (ATDD)', () => {
  test('[P0] AC4: Widget builds to standalone JS bundle at dist/widget/', async () => {
    // THIS TEST WILL FAIL - Vite build not configured yet
    // Run Vite build for widget
    execSync('npm run build:widget', { cwd: process.cwd() });

    // Verify bundle exists at dist/widget/
    const bundlePath = path.join(process.cwd(), 'dist', 'widget');
    expect(fs.existsSync(bundlePath)).toBeTruthy();

    // Verify bundle files exist
    const files = fs.readdirSync(bundlePath);
    expect(files.some((f) => f.endsWith('.js') || f.endsWith('.mjs'))).toBeTruthy();
  });

  test('[P0] AC5: Bundle exports <booking-widget> custom element', async () => {
    // THIS TEST WILL FAIL - Custom element not registered yet
    // Build widget first
    execSync('npm run build:widget', { cwd: process.cwd() });

    // Read the bundle file
    const bundlePath = path.join(process.cwd(), 'dist', 'widget');
    const jsFiles = fs.readdirSync(bundlePath).filter((f) => f.endsWith('.js') || f.endsWith('.mjs'));

    // Verify custom element is registered
    for (const file of jsFiles) {
      const content = fs.readFileSync(path.join(bundlePath, file), 'utf-8');
      if (content.includes('customElements.define')) {
        expect(content).toContain('booking-widget');
        break;
      }
    }
  });

  test('[P0] AC8: Firebase emulators available locally', async () => {
    // THIS TEST WILL FAIL - Firebase emulators not configured yet
    // Check if firebase.json exists
    const firebaseConfigPath = path.join(process.cwd(), 'firebase.json');
    expect(fs.existsSync(firebaseConfigPath)).toBeTruthy();

    // Verify emulator configuration
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    expect(config.emulators).toBeDefined();
    expect(config.emulators.firestore).toBeDefined();
    expect(config.emulators.auth).toBeDefined();
    expect(config.emulators.hosting).toBeDefined();
  });
});
