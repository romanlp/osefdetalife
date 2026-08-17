import {Component, computed, inject, input, resource} from '@angular/core';
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

  slug = input<string>();

  restaurant = resource({
    params: () => ({slug: this.slug()}),
    loader: async ({params}) => {
      if (!params.slug) return null;
      return this.bookingService.getRestaurantBySlug(params.slug);
    },
  });

  brandPrimary = computed(
    () => this.restaurant.value()?.whiteLabel?.primaryColor ?? DESIGN_PRIMARY,
  );
  brandSecondary = computed(
    () => this.restaurant.value()?.whiteLabel?.secondaryColor ?? DESIGN_SECONDARY,
  );

  retry(): void {
    this.restaurant.reload();
  }
}
