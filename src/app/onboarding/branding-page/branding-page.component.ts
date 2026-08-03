import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatInput, MatFormField, MatLabel } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { OnboardingService } from '../../services/onboarding.service';

const DESIGN_PRIMARY = '#1A1A1A';
const DESIGN_SECONDARY = '#8FA67A';
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

@Component({
  templateUrl: './branding-page.component.html',
  styleUrls: ['./branding-page.component.scss'],
  imports: [
    FormsModule,
    MatButton,
    MatCardModule,
    MatInput,
    MatFormField,
    MatLabel,
    MatProgressBar,
    MatCheckbox,
  ],
})
export class BrandingPageComponent implements OnInit {
  private onboardingService = inject(OnboardingService);
  private router = inject(Router);
  private restaurantId: string | null = null;

  loading = signal(false);
  saving = signal(false);
  prefillFailed = signal(false);
  error = signal<string | null>(null);

  primaryColor = signal<string>(DESIGN_PRIMARY);
  secondaryColor = signal<string>(DESIGN_SECONDARY);
  customFieldLabel = signal<string>('');
  customFieldRequired = signal<boolean>(false);
  customFieldEnabled = signal<boolean>(false);

  hexError = computed(() => {
    if (!HEX_COLOR_PATTERN.test(this.primaryColor())) {
      return 'Enter a valid hex color for the primary color (e.g. #1A1A1A)';
    }
    if (!HEX_COLOR_PATTERN.test(this.secondaryColor())) {
      return 'Enter a valid hex color for the secondary color (e.g. #8FA67A)';
    }
    return null;
  });

  busy = computed(() => this.loading() || this.saving());

  canComplete = computed(() => this.hexError() === null && !this.busy() && !this.prefillFailed());

  async ngOnInit() {
    this.loading.set(true);
    try {
      const user = this.onboardingService.getCurrentUser();
      if (!user) return;

      const restaurant = await this.onboardingService.getRestaurantByOwner(user.uid);
      if (!restaurant) return;

      this.restaurantId = restaurant.id;

      if (restaurant.whiteLabel) {
        this.primaryColor.set(restaurant.whiteLabel.primaryColor ?? DESIGN_PRIMARY);
        this.secondaryColor.set(restaurant.whiteLabel.secondaryColor ?? DESIGN_SECONDARY);
      }

      if (restaurant.customField) {
        this.customFieldLabel.set(restaurant.customField.label ?? '');
        this.customFieldRequired.set(restaurant.customField.required ?? false);
        this.customFieldEnabled.set(restaurant.customField.enabled ?? false);
      }
    } catch (e: unknown) {
      console.error('Failed to prefill branding settings', e);
      this.prefillFailed.set(true);
      this.error.set('Unable to load your saved settings. Please refresh and try again.');
    } finally {
      this.loading.set(false);
    }
  }

  onPrimaryHexChange(value: string) {
    this.primaryColor.set(value);
  }

  onSecondaryHexChange(value: string) {
    this.secondaryColor.set(value);
  }

  onPrimarySwatchChange(value: string) {
    this.primaryColor.set(value);
  }

  onSecondarySwatchChange(value: string) {
    this.secondaryColor.set(value);
  }

  onCustomFieldLabelChange(value: string) {
    this.customFieldLabel.set(value);
  }

  async completeOnboarding() {
    if (!this.canComplete() || !this.restaurantId) return;

    this.saving.set(true);
    this.error.set(null);

    try {
      await this.onboardingService.updateRestaurant(this.restaurantId, {
        whiteLabel: {
          primaryColor: this.primaryColor(),
          secondaryColor: this.secondaryColor(),
        },
        customField: {
          label: this.customFieldLabel(),
          required: this.customFieldRequired(),
          enabled: this.customFieldEnabled(),
        },
        onboardingCompleted: true,
      });

      this.router.navigate(['/dashboard']);
    } catch (e: unknown) {
      console.error('Failed to complete onboarding', e);
      this.error.set('Something went wrong. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  async skipOnboarding(event: Event) {
    event.preventDefault();
    if (this.busy()) return;

    if (!this.restaurantId) {
      this.error.set('Unable to load your restaurant. Please refresh and try again.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    try {
      await this.onboardingService.updateRestaurant(this.restaurantId, {
        onboardingCompleted: true,
      });

      this.router.navigate(['/dashboard']);
    } catch (e: unknown) {
      console.error('Failed to skip onboarding', e);
      this.error.set('Something went wrong. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }
}
