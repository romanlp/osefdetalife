import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['firestore.rules.spec.ts'],
    testTimeout: 30000,
    pool: 'forks',
    globalSetup: './firestore-rules-setup.ts',
    teardownTimeout: 10000,
  },
});
