import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../app/services/auth.service';
import { OnboardingService } from '../../../app/services/onboarding.service';
import { environment } from '../../../environments/environment';
import type { Restaurant } from '../../../shared/types/restaurant';

@Component({
  selector: 'osef-deploy-page',
  imports: [],
  templateUrl: './deploy-page.component.html',
  styleUrl: './deploy-page.component.scss',
})
export class DeployPageComponent {
  private authService = inject(AuthService);
  private onboardingService = inject(OnboardingService);
  private widgetBundleUrl = environment.widgetBundleUrl;

  restaurant = signal<Restaurant | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  copied = signal(false);
  copyError = signal<string | null>(null);
  private copyTimeout: number | undefined;

  embedSnippet = computed(() => {
    const restaurant = this.restaurant();
    if (!restaurant) return '';
    return `<script src="${this.widgetBundleUrl}" type="module"></script>
<booking-widget restaurant="${restaurant.slug}"></booking-widget>`;
  });

  demoUrl = computed(() => {
    const restaurant = this.restaurant();
    if (!restaurant) return '';
    return `${window.location.origin}/assets/demo.html?slug=${restaurant.slug}`;
  });

  constructor() {
    void this.loadRestaurant();
  }

  private async loadRestaurant(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const user = this.authService.user();
      if (!user) {
        throw new Error('No authenticated user');
      }
      this.restaurant.set(
        await this.onboardingService.getRestaurantByOwner(user.uid),
      );
    } catch {
      this.error.set('Unable to load your embed code. Please refresh and try again.');
    } finally {
      this.loading.set(false);
    }
  }

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.embedSnippet());
      this.copyError.set(null);
      this.copied.set(true);
      window.clearTimeout(this.copyTimeout);
      this.copyTimeout = window.setTimeout(() => this.copied.set(false), 2000);
    } catch {
      this.copied.set(false);
      this.copyError.set('Unable to copy the embed code. Please copy it manually.');
    }
  }
}
