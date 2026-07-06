import { MediaMatcher } from '@angular/cdk/layout';
import { Injectable, effect, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemingService {
  private mediaMatcher = inject(MediaMatcher);

  themes = ['dark-theme', 'light-theme']; // <- list all themes in this array

  currentTheme = signal('light-theme');

  constructor() {
    const mediaMatcher = this.mediaMatcher;

    // Initially check if dark mode is enabled on system
    const darkModeOn = mediaMatcher.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;

    // If dark mode is enabled then directly switch to the dark-theme
    if (darkModeOn) {
      this.currentTheme.set('dark-theme');
    }

    // Watch for changes of the preference
    mediaMatcher
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        const turnOn = e.matches;
        this.currentTheme.set(turnOn ? 'dark-theme' : 'light-theme');
      });

    effect(() => {
      document.body.className = this.currentTheme();
    });
  }

  switch() {
    const newTheme =
      this.currentTheme() === 'light-theme' ? 'dark-theme' : 'light-theme';
    this.currentTheme.set(newTheme);
  }
}
