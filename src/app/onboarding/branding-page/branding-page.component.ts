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

  loading = signal(false);
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

  canComplete = computed(() => this.hexError() === null && !this.loading());

  async ngOnInit() {
    this.loading.set(true);
    try {
      const user = this.onboardingService.getCurrentUser();
      if (!user) return;

      const restaurant = await this.onboardingService.getRestaurantByOwner(user.uid);
      if (!restaurant) return;

      if (restaurant.whiteLabel) {
        this.primaryColor.set(restaurant.whiteLabel.primaryColor);
        this.secondaryColor.set(restaurant.whiteLabel.secondaryColor);
      }

      if (restaurant.customField) {
        this.customFieldLabel.set(restaurant.customField.label);
        this.customFieldRequired.set(restaurant.customField.required);
        this.customFieldEnabled.set(restaurant.customField.enabled);
      }
    } catch {
      // Silently ignore — defaults will be used
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
    if (!this.canComplete()) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const restaurantId = await this.getRestaurantId();
      await this.onboardingService.updateRestaurant(restaurantId, {
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
      const message = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  async skipOnboarding(event: Event) {
    event.preventDefault();
    if (this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const restaurantId = await this.getRestaurantId();
      await this.onboardingService.updateRestaurant(restaurantId, {
        onboardingCompleted: true,
      });

      this.router.navigate(['/dashboard']);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  private async getRestaurantId(): Promise<string> {
    const user = this.onboardingService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const restaurant = await this.onboardingService.getRestaurantByOwner(user.uid);
    if (!restaurant) throw new Error('Restaurant not found');

    return restaurant.id;
  }
}
