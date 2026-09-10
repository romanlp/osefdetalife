import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  output,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import type { OpeningHours, TableGroup } from '../../../shared/types/restaurant';
import { BookingService } from '../../services/booking.service';
import { availableSlots, clockMinutes, zonedMinutesOfDay } from '../../utils/availability';
import { zonedToday } from '../../utils/calendar';
import { NOW } from '../../utils/clock';

@Component({
  selector: 'osef-time-slot-step',
  templateUrl: './time-slot-step.component.html',
  styleUrl: './time-slot-step.component.scss',
})
export class TimeSlotStepComponent implements AfterViewInit {
  readonly restaurantId = input.required<string>();
  readonly hours = input.required<OpeningHours>();
  readonly timezone = input.required<string>();
  readonly tableGroups = input.required<TableGroup[]>();
  readonly date = input.required<string>();
  readonly partySize = input.required<number>();

  /** Chosen slot ("HH:mm") highlighted when returning via back navigation. */
  readonly selected = input<string | null>(null);

  readonly slotSelect = output<string>();
  readonly back = output<void>();

  private readonly bookingService = inject(BookingService);
  private readonly now = inject(NOW);
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('heading');

  ngAfterViewInit(): void {
    this.heading().nativeElement.focus();
  }

  /** Self-fetching availability, keyed on date + party size; retry bumps the tick. */
  private readonly refreshTick = signal(0);

  readonly slots = resource({
    params: () => ({
      restaurantId: this.restaurantId(),
      hours: this.hours(),
      timezone: this.timezone(),
      tableGroups: this.tableGroups(),
      date: this.date(),
      partySize: this.partySize(),
      tick: this.refreshTick(),
    }),
    loader: async ({ params }) => {
      const bookings = await this.bookingService.getPublicBookings(
        params.restaurantId,
        params.date,
      );
      const now = this.now();
      const todayIso = zonedToday(params.timezone, now).iso;
      return availableSlots({
        hours: params.hours,
        iso: params.date,
        bookings,
        partySize: params.partySize,
        tableGroups: params.tableGroups,
        nowMinutes: params.date === todayIso ? zonedMinutesOfDay(params.timezone, now) : null,
      });
    },
  });

  retry(): void {
    this.refreshTick.update((tick) => tick + 1);
  }

  choose(slot: string): void {
    this.slotSelect.emit(slot);
  }

  /** Machine testid from an "HH:mm" value: "19:00" → "time-option-19-00". */
  slotTestId(slot: string): string {
    return `time-option-${slot.replace(':', '-')}`;
  }

  /** 12-hour display label for an "HH:mm" value — the stored value stays 24-hour. */
  displayLabel(slot: string): string {
    const minutes = clockMinutes(slot);
    if (!Number.isFinite(minutes)) return slot;
    const hours = Math.floor(minutes / 60);
    const mins = ((minutes % 60) + 60) % 60;
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(Date.UTC(2000, 0, 1, hours, mins)));
  }
}
