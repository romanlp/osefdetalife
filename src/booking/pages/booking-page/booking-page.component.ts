import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  resource,
  viewChild,
} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {BookingService} from '../../services/booking.service';
import {BookingFlowService, type BookingFlowStep} from '../../services/booking-flow.service';
import {CalendarStepComponent} from '../../steps/calendar-step/calendar-step.component';
import {PartySizeStepComponent} from '../../steps/party-size-step/party-size-step.component';

const DESIGN_PRIMARY = '#1A1A1A';
const DESIGN_SECONDARY = '#8FA67A';

/** Steps in the funnel including landing and the future submit step. */
const TOTAL_STEPS = 6;

@Component({
  selector: 'osef-booking-page',
  host: {
    '[style.--osef-brand-primary]': 'brandPrimary()',
    '[style.--osef-brand-secondary]': 'brandSecondary()',
  },
  imports: [PartySizeStepComponent, CalendarStepComponent],
  templateUrl: './booking-page.component.html',
  styleUrl: './booking-page.component.scss',
})
export class BookingPageComponent {
  private bookingService = inject(BookingService);

  private title = inject(Title);

  readonly flow = inject(BookingFlowService);

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

  /** Polite announcement for screen readers on every step transition. */
  stepAnnouncement = computed<string>(() => {
    const announcements: Record<Exclude<BookingFlowStep, 'landing'>, string> = {
      'party-size': `Step 2 of ${TOTAL_STEPS}: Party Size`,
      date: `Step 3 of ${TOTAL_STEPS}: Date`,
      time: `Step 4 of ${TOTAL_STEPS}: Time`,
    };
    const step = this.flow.step();
    return step === 'landing' ? '' : announcements[step];
  });

  /** Human-readable selected date for the time-slot stub summary. */
  selectedDateLabel = computed<string>(() => {
    const iso = this.flow.selectedDate();
    if (!iso) return '';
    const [year, month, day] = iso.split('-').map(Number);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(Date.UTC(year, month - 1, day)));
  });

  private readonly timeHeading = viewChild<ElementRef<HTMLHeadingElement>>('timeHeading');

  private readonly bookButton = viewChild<ElementRef<HTMLButtonElement>>('bookButton');

  constructor() {
    // The flow service is a root singleton that outlives this page — clear any
    // half-finished funnel when the user leaves, so a same-slug revisit starts fresh.
    inject(DestroyRef).onDestroy(() => this.flow.reset());

    effect(() => {
      try {
        const restaurant = this.restaurant.value();
        this.title.setTitle(restaurant?.name ? `${restaurant.name} — Book a Table` : 'Booking');
      } catch {
        this.title.setTitle('Booking');
      }
    });

    // A fresh restaurant (initial load, retry, or slug change) resets the flow.
    effect(() => {
      try {
        this.restaurant.value();
      } catch {
        // Error state — nothing to reset against; the error UI takes over.
      }
      this.flow.reset();
    });

    // Focus the time-slot stub heading whenever that step mounts.
    effect(() => {
      const heading = this.timeHeading();
      if (heading && this.flow.step() === 'time') {
        heading.nativeElement.focus();
      }
    });

    // Returning to landing from a later step moves focus to the primary CTA.
    // Latched so initial page load never steals focus, and so the focus retries
    // until the button actually exists (the switch renders one tick later).
    let hasEnteredFlow = false;
    let landingFocusApplied = false;
    effect(() => {
      const step = this.flow.step();
      if (step !== 'landing') {
        hasEnteredFlow = true;
        landingFocusApplied = false;
      }
      const button = this.bookButton();
      if (step === 'landing' && hasEnteredFlow && !landingFocusApplied && button) {
        button.nativeElement.focus();
        landingFocusApplied = true;
      }
    });
  }

  onPartySize(size: number): void {
    this.flow.choosePartySize(size);
  }

  onDate(iso: string): void {
    this.flow.chooseDate(iso);
  }

  retry(): void {
    this.restaurant.reload();
  }
}
