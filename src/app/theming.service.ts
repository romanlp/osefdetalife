import { MediaMatcher } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import { ApplicationRef, Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemingService {

  themes = ['dark-theme', 'light-theme']; // <- list all themes in this array
  theme = new BehaviorSubject('light-theme'); // <- initial theme

  constructor(private ref: ApplicationRef,
              @Inject(DOCUMENT) document: Document,
              private mediaMatcher: MediaMatcher) {

    this.theme.subscribe((theme: string) => {
      document.body.className = theme;
    });

    // Initially check if dark mode is enabled on system
    const darkModeOn =
      mediaMatcher.matchMedia &&
      mediaMatcher.matchMedia('(prefers-color-scheme: dark)').matches;

    // If dark mode is enabled then directly switch to the dark-theme
    if (darkModeOn) {
      this.theme.next('dark-theme');
    }

    // Watch for changes of the preference
    mediaMatcher.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      const turnOn = e.matches;
      this.theme.next(turnOn ? 'dark-theme' : 'light-theme');

      // Trigger refresh of UI
      this.ref.tick();
    });
  }

  switch() {
    this.theme.next(this.theme.getValue() === 'light-theme' ? 'dark-theme' : 'light-theme');
  }
}
