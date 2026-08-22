import { InjectionToken } from '@angular/core';

/**
 * Injectable clock — the only sanctioned source of `new Date()`.
 * Override in tests with a fixed instant for deterministic time/timezone behavior.
 */
export const NOW = new InjectionToken<() => Date>('osef.now', {
  factory: () => () => new Date(),
});
