import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MediaMatcher } from '@angular/cdk/layout';
import { ThemingService } from './theming.service';

describe('ThemingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MediaMatcher,
          useValue: {
            matchMedia: () => ({
              matches: false,
              addEventListener: () => { return undefined },
            }),
          },
        },
      ],
    });
  });

  it('should export the service class', () => {
    expect(typeof ThemingService).toBe('function');
  });

  it('should have a currentTheme signal', () => {
    const service = TestBed.inject(ThemingService);
    expect(service.currentTheme).toBeDefined();
    expect(typeof service.currentTheme()).toBe('string');
  });

  it('should have a themes array', () => {
    const service = TestBed.inject(ThemingService);
    expect(service.themes).toContain('dark-theme');
    expect(service.themes).toContain('light-theme');
  });

  it('should have a switch method', () => {
    const service = TestBed.inject(ThemingService);
    expect(typeof service.switch).toBe('function');
  });
});
