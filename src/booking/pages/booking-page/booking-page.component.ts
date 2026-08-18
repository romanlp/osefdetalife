import {Component, computed, effect, inject, input, resource} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {BookingService} from '../../services/booking.service';

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

  private title = inject(Title);

  slug = input<string>();

  restaurant = resource({
    params: () => ({slug: this.slug()}),
    loader: async ({params}) => {
      if (!params.slug) return null;
      return this.bookingService.getRestaurantBySlug(params.slug);
    },
  });

  brandPrimary = computed(() => {
    try {
      return this.restaurant.value()?.whiteLabel?.primaryColor ?? DESIGN_PRIMARY;
    } catch {
      return DESIGN_PRIMARY;
    }
  });
  brandSecondary = computed(() => {
    try {
      return this.restaurant.value()?.whiteLabel?.secondaryColor ?? DESIGN_SECONDARY;
    } catch {
      return DESIGN_SECONDARY;
    }
  });

  constructor() {
    effect(() => {
      try {
        const restaurant = this.restaurant.value();
        this.title.setTitle(restaurant?.name ? `${restaurant.name} — Book a Table` : 'Booking');
      } catch {
        this.title.setTitle('Booking');
      }
    });
  }

  retry(): void {
    this.restaurant.reload();
  }
}
