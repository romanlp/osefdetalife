import { test, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Story 1.1: Project Scaffolding - TypeScript & Structure (ATDD)', () => {
  test('[P1] AC2: TypeScript strict mode enabled', () => {
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    expect(fs.existsSync(tsConfigPath)).toBeTruthy();

    const raw = fs.readFileSync(tsConfigPath, 'utf-8');
    const stripped = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    const tsConfig = JSON.parse(stripped);
    expect(tsConfig.compilerOptions?.strict).toBeTruthy();
  });

  test('[P1] AC3: Project structure matches Architecture Spine', () => {
    // THIS TEST WILL FAIL - Project structure not created yet
    const dashboardPath = path.join(process.cwd(), 'src', 'dashboard');
    const widgetPath = path.join(process.cwd(), 'src', 'widget');
    const sharedPath = path.join(process.cwd(), 'src', 'shared');

    expect(fs.existsSync(dashboardPath)).toBeTruthy();
    expect(fs.existsSync(widgetPath)).toBeTruthy();
    expect(fs.existsSync(sharedPath)).toBeTruthy();
  });

  test('[P1] AC6: Shared TypeScript interfaces available', () => {
    // THIS TEST WILL FAIL - Interfaces not defined yet
    const sharedPath = path.join(process.cwd(), 'src', 'shared');
    expect(fs.existsSync(sharedPath)).toBeTruthy();

    // Check for interface files
    const files = fs.readdirSync(sharedPath);
    const interfaceFiles = files.filter(
      (f) => f.endsWith('.ts') && !f.endsWith('.spec.ts') && !f.endsWith('.d.ts')
    );

    // Verify interfaces exist (would need to import and check types)
    expect(interfaceFiles.length).toBeGreaterThan(0);
  });

  test('[P1] AC7: Shared Firebase initialization module exported', () => {
    // THIS TEST WILL FAIL - Firebase module not implemented yet
    const sharedPath = path.join(process.cwd(), 'src', 'shared');
    expect(fs.existsSync(sharedPath)).toBeTruthy();

    // Check for Firebase initialization file
    const files = fs.readdirSync(sharedPath);
    const firebaseFiles = files.filter(
      (f) => f.toLowerCase().includes('firebase') && f.endsWith('.ts')
    );

    expect(firebaseFiles.length).toBeGreaterThan(0);
  });
});
