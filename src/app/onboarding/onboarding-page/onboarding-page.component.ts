import { Component, inject, signal, computed, effect, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInput, MatFormField, MatLabel, MatHint, MatError } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  templateUrl: './onboarding-page.component.html',
  styleUrls: ['./onboarding-page.component.scss'],
  imports: [FormsModule, MatButton, MatCardModule, MatInput, MatFormField, MatLabel, MatHint, MatError, MatProgressBar],
})
export class OnboardingPageComponent {
  private onboardingService = inject(OnboardingService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  name = signal('');
  slug = signal('');
  address = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  slugAvailable = signal<boolean | null>(null);
  slugChecking = signal(false);
  userEditedSlug = signal(false);

  private slugCheckTimeout: ReturnType<typeof setTimeout> | null = null;

  slugPreview = computed(() => {
    const s = this.slug();
    return s ? `bookable.co/${s}` : '';
  });

  slugHint = computed(() => {
    if (this.slugChecking()) return 'Checking availability...';
    if (this.slugAvailable() === true) return 'Slug is available';
    if (this.slugAvailable() === false) return 'Slug is already taken';
    return null;
  });

  canContinue = computed(() => {
    return this.name().trim().length > 0 && this.slug().trim().length > 0 && this.slugAvailable() === true && !this.loading();
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.slugCheckTimeout) {
        clearTimeout(this.slugCheckTimeout);
      }
    });

    effect(() => {
      const name = this.name();
      if (name.trim().length > 0 && !this.userEditedSlug()) {
        const generated = this.onboardingService.generateSlug(name);
        this.slug.set(generated);
        this.checkSlugAvailability(generated);
      }
    });
  }

  onSlugInput(value: string) {
    this.userEditedSlug.set(true);
    this.slug.set(value);
    this.slugAvailable.set(null);
    this.checkSlugAvailability(value);
  }

  onNameInput(value: string) {
    this.name.set(value);
    if (!this.userEditedSlug()) {
      this.slugAvailable.set(null);
    }
  }

  private checkSlugAvailability(slug: string) {
    if (this.slugCheckTimeout) {
      clearTimeout(this.slugCheckTimeout);
    }

    if (!slug.trim()) {
      this.slugAvailable.set(null);
      this.slugChecking.set(false);
      return;
    }

    this.slugChecking.set(true);
    this.slugCheckTimeout = setTimeout(async () => {
      try {
        const available = await this.onboardingService.checkSlugAvailability(slug);
        this.slugAvailable.set(available);
      } catch {
        this.slugAvailable.set(null);
      } finally {
        this.slugChecking.set(false);
      }
    }, 300);
  }

  async continueToStep2() {
    if (!this.canContinue()) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const address = this.address().trim();
      await this.onboardingService.createRestaurant(
        this.name().trim(),
        this.slug().trim(),
        address || undefined,
      );
      this.router.navigate(['/onboarding/step-2']);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}
