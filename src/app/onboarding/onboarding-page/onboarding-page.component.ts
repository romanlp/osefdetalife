import { Component, inject, signal, computed, effect, debounced, resource } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInput, MatFormField, MatLabel, MatHint } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { OnboardingService } from '../../services/onboarding.service';

interface OnboardingFormData {
  name: string;
  slug: string;
  address: string;
}

@Component({
  templateUrl: './onboarding-page.component.html',
  styleUrls: ['./onboarding-page.component.scss'],
  imports: [FormField, MatButton, MatCardModule, MatInput, MatFormField, MatLabel, MatHint, MatProgressBar],
})
export class OnboardingPageComponent {
  private onboardingService = inject(OnboardingService);
  private router = inject(Router);

  formData = signal<OnboardingFormData>({
    name: '',
    slug: '',
    address: '',
  });

  onboardingForm = form(this.formData, (schemaPath) => {
    required(schemaPath.name, { message: 'Restaurant name is required' });
    required(schemaPath.slug, { message: 'Booking link slug is required' });
  });

  loading = signal(false);
  error = signal<string | null>(null);
  userEditedSlug = signal(false);

  private slug = computed(() => this.formData().slug);
  private debouncedSlug = debounced(this.slug, 300);

  slugCheck = resource({
    params: () => {
      const slug = this.debouncedSlug.value();
      return slug?.trim() ? { slug: slug.trim() } : undefined;
    },
    loader: ({ params }) => this.onboardingService.checkSlugAvailability(params.slug),
  });

  slugAvailable = computed(() => this.slugCheck.status() === 'resolved' ? this.slugCheck.value() ?? null : null);
  slugChecking = computed(() => this.slugCheck.status() === 'loading' || this.slugCheck.status() === 'reloading');
  slugError = computed(() => this.slugCheck.status() === 'error' ? 'Unable to check slug availability. Please try again.' : null);

  slugPreview = computed(() => {
    const s = this.formData().slug;
    return s ? `bookable.co/${s}` : '';
  });

  slugHint = computed(() => {
    if (this.slugChecking()) return 'Checking availability...';
    if (this.slugAvailable() === true) return 'Slug is available';
    if (this.slugAvailable() === false) return 'Slug is already taken';
    return null;
  });

  canContinue = computed(() => {
    const { name, slug } = this.formData();
    return name.trim().length > 0 && slug.trim().length > 0 && this.slugAvailable() === true && !this.loading();
  });

  constructor() {
    effect(() => {
      const name = this.formData().name;
      if (name.trim().length > 0 && !this.userEditedSlug()) {
        const generated = this.onboardingService.generateSlug(name);
        const currentSlug = this.formData().slug;
        if (generated !== currentSlug) {
          this.onboardingForm.slug().value.set(generated);
        }
      }
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.continueToStep2();
  }

  onSlugInput() {
    this.userEditedSlug.set(true);
    const slug = this.formData().slug;
    if (!slug.trim()) {
      return;
    }
    const normalized = this.onboardingService.generateSlug(slug);
    if (normalized !== slug) {
      this.onboardingForm.slug().value.set(normalized);
    }
  }

  async continueToStep2() {
    if (!this.canContinue()) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const { name, slug, address } = this.formData();
      await this.onboardingService.createRestaurant(
        name.trim(),
        slug.trim(),
        address.trim() || undefined,
      );
      this.router.navigate(['/onboarding/availability']);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}
