import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import type { Restaurant } from '../../../shared/types/restaurant';

const DESIGN_PRIMARY = '#1A1A1A';
const DESIGN_SECONDARY = '#8FA67A';

@Component({
  selector: 'osef-booking-page',
  host: {
    '[style.--osef-brand-primary]': 'brandPrimary()',
    '[style.--osef-brand-secondary]': 'brandSecondary()',
  },
  imports: [],
  templateUrl: './booking-page.component.html',
  styleUrl: './booking-page.component.scss',
})
export class BookingPageComponent {
  private bookingService = inject(BookingService);
  private route = inject(ActivatedRoute);

  restaurant = signal<Restaurant | null>(null);
  loading = signal(true);
  error = signal(false);

  brandPrimary = computed(
    () => this.restaurant()?.whiteLabel?.primaryColor ?? DESIGN_PRIMARY,
  );
  brandSecondary = computed(
    () => this.restaurant()?.whiteLabel?.secondaryColor ?? DESIGN_SECONDARY,
  );

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

    this.loading.set(true);
    this.error.set(false);
    try {
      this.restaurant.set(await this.bookingService.getRestaurantBySlug(slug));
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  retry(): void {
    void this.load();
  }
}
