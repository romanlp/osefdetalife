import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeSlotStepComponent } from './time-slot-step.component';
import { BookingService } from '../../services/booking.service';
import { NOW } from '../../utils/clock';
import type { PublicBookingProjection } from '../../../shared/types/booking';
import type { OpeningHours, TableGroup } from '../../../shared/types/restaurant';

/** Open every day 09:00–17:00. */
const HOURS_9_TO_17: OpeningHours = {
  1: { open: '09:00', close: '17:00' },
  2: { open: '09:00', close: '17:00' },
  3: { open: '09:00', close: '17:00' },
  4: { open: '09:00', close: '17:00' },
  5: { open: '09:00', close: '17:00' },
  6: { open: '09:00', close: '17:00' },
  7: { open: '09:00', close: '17:00' },
};

/** Late evening hours — exercises bookings late in the service. */
const HOURS_9_TO_23: OpeningHours = {
  1: { open: '09:00', close: '23:00' },
  2: { open: '09:00', close: '23:00' },
  3: { open: '09:00', close: '23:00' },
  4: { open: '09:00', close: '23:00' },
  5: { open: '09:00', close: '23:00' },
  6: { open: '09:00', close: '23:00' },
  7: { open: '09:00', close: '23:00' },
};

const TABLE_GROUPS: TableGroup[] = [
  { capacity: 2, count: 2 },
  { capacity: 4, count: 3 },
  { capacity: 6, count: 1 },
];

/**
 * Thursday 2026-08-20 at 12:00 UTC = 13:00 London on Thu Aug 20. The default
 * requested date (Fri 2026-08-21) is tomorrow in London, so the now-filter
 * stays out of the way unless a case opts in by requesting 2026-08-20.
 */
const FIXED_NOW = () => new Date('2026-08-20T12:00:00Z');

describe('TimeSlotStepComponent', () => {
  let fixture: ComponentFixture<TimeSlotStepComponent>;
  let bookingServiceSpy: { getPublicBookings: ReturnType<typeof vi.fn> };

  function queryEl(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(() => {
    bookingServiceSpy = { getPublicBookings: vi.fn() };
  });

  async function createComponent(
    overrides: {
      hours?: OpeningHours;
      tableGroups?: TableGroup[];
      date?: string;
      partySize?: number;
      selected?: string | null;
      timezone?: string;
      projections?: PublicBookingProjection[];
      reject?: boolean;
    } = {},
  ): Promise<void> {
    bookingServiceSpy.getPublicBookings.mockReset();
    if (overrides.reject) {
      bookingServiceSpy.getPublicBookings.mockRejectedValue(new Error('offline'));
    } else {
      bookingSpyResolve(overrides.projections ?? []);
    }

    await TestBed.configureTestingModule({
      imports: [TimeSlotStepComponent],
      providers: [
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: NOW, useValue: FIXED_NOW },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeSlotStepComponent);
    fixture.componentRef.setInput('restaurantId', 'rest-123');
    fixture.componentRef.setInput('hours', overrides.hours ?? HOURS_9_TO_17);
    fixture.componentRef.setInput('tableGroups', overrides.tableGroups ?? TABLE_GROUPS);
    fixture.componentRef.setInput('timezone', overrides.timezone ?? 'Europe/London');
    fixture.componentRef.setInput('date', overrides.date ?? '2026-08-21');
    fixture.componentRef.setInput('partySize', overrides.partySize ?? 4);
    fixture.componentRef.setInput('selected', overrides.selected ?? null);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function bookingSpyResolve(projections: PublicBookingProjection[]): void {
    bookingServiceSpy.getPublicBookings.mockResolvedValue(projections);
  }

  function projection(time: string, partySize = 4): PublicBookingProjection {
    return { restaurantId: 'rest-123', date: '2026-08-21', time, partySize, status: 'confirmed' };
  }

  function renderedTestIds(): string[] {
    return [...queryEl().querySelectorAll<HTMLButtonElement>('.pill')].map(
      (button) => button.getAttribute('data-testid')!,
    );
  }

  describe('HAPPY_PATH_SLOT', () => {
    it('[P0] should render window-fitting pills as horizontally scrollable targets', async () => {
      await createComponent();

      const testIds = renderedTestIds();

      // 09:00..15:00 — a 120-minute window must end ≤ the 17:00 close.
      expect(testIds[0]).toBe('time-option-09-00');
      expect(testIds.at(-1)).toBe('time-option-15-00');
      expect(testIds).toHaveLength(25);
      expect(queryEl().querySelector('.pills')).toBeTruthy();
    });

    it('[P0] should display 12-hour labels while keeping HH:mm values', async () => {
      await createComponent();

      const firstPill = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="time-option-09-00"]',
      )!;
      expect(firstPill.textContent?.trim()).toBe('9:00 am');

      const evening = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="time-option-15-00"]',
      )!;
      expect(evening.textContent?.trim()).toBe('3:00 pm');
    });

    it('[P0] should emit the HH:mm slot when a pill is tapped', async () => {
      await createComponent();

      const emitted: string[] = [];
      fixture.componentInstance.slotSelect.subscribe((slot) => emitted.push(slot));

      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="time-option-10-30"]')!
        .click();
      fixture.detectChanges();

      expect(emitted).toEqual(['10:30']);
    });

    it('[P1] should highlight the previously chosen slot via the selected input', async () => {
      await createComponent({ selected: '10:30' });

      const selected = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="time-option-10-30"]',
      )!;
      const other = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="time-option-11-00"]',
      )!;

      expect(selected.classList.contains('selected')).toBe(true);
      expect(selected.getAttribute('aria-pressed')).toBe('true');
      expect(other.classList.contains('selected')).toBe(false);
      expect(other.getAttribute('aria-pressed')).toBe('false');
    });

    it('[P1] should move focus to the step heading on init', async () => {
      await createComponent();

      const heading = queryEl().querySelector<HTMLHeadingElement>('h2')!;
      expect(document.activeElement).toBe(heading);
      expect(heading.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('OCCUPIED_WINDOW', () => {
    it('[P0] should drop slots overlapping a confirmed booking on the sole qualifying pool', async () => {
      // Party of 6 → only the single cap-6 table qualifies; it is booked 19:00–21:00.
      await createComponent({
        hours: HOURS_9_TO_23,
        partySize: 6,
        tableGroups: [{ capacity: 6, count: 1 }],
        projections: [projection('19:00', 6)],
      });

      const testIds = renderedTestIds();

      expect(testIds).toContain('time-option-17-00'); // ends exactly when the booking starts
      expect(testIds).not.toContain('time-option-17-15');
      expect(testIds).not.toContain('time-option-18-30');
      expect(testIds).not.toContain('time-option-19-00');
      expect(testIds).not.toContain('time-option-20-45');
      expect(testIds).toContain('time-option-21-00'); // starts exactly when it ends
      expect(testIds.at(-1)).toBe('time-option-21-00');
    });
  });

  describe('CAPACITY_SCARCITY', () => {
    it('[P1] should ignore smaller-table bookings for large parties', async () => {
      await createComponent({
        partySize: 6,
        projections: [projection('10:00', 2), projection('11:00', 4)],
      });

      // Small parties sit at small tables — the six-top pool stays untouched all day.
      expect(renderedTestIds()).toContain('time-option-10-00');
      expect(renderedTestIds()).toContain('time-option-11-00');
    });
  });

  describe('NO_TIMES', () => {
    it('[P0] should show the exact empty message when no slot qualifies', async () => {
      await createComponent({
        partySize: 6,
        tableGroups: [{ capacity: 6, count: 1 }],
        projections: [
          projection('09:00', 6),
          projection('11:00', 6),
          projection('13:00', 6),
          projection('15:00', 6),
        ],
      });

      const empty = queryEl().querySelector('[data-testid="time-empty"]');
      expect(empty?.textContent?.trim()).toBe('No available times for this date.');
      expect(queryEl().querySelectorAll('.pill')).toHaveLength(0);
    });

    it('[P0] should show the empty state for today after close', async () => {
      // Fixed clock is 13:00 London on Thu 2026-08-20 — a 09:00–12:00 service is fully over.
      await createComponent({
        date: '2026-08-20',
        hours: { 4: { open: '09:00', close: '12:00' } },
      });

      expect(queryEl().querySelector('[data-testid="time-empty"]')?.textContent?.trim()).toBe(
        'No available times for this date.',
      );
    });

    it('[P1] should show the empty state when no table group reaches the party size', async () => {
      await createComponent({
        partySize: 8,
        projections: [],
      });

      expect(queryEl().querySelector('[data-testid="time-empty"]')).toBeTruthy();
    });
  });

  describe('TODAY_PAST_SLOTS', () => {
    it('[P0] should exclude today slots starting at/before now and keep later ones', async () => {
      // Fixed clock is 13:00 London on Thu 2026-08-20 — requesting that date is "today".
      await createComponent({ date: '2026-08-20' });

      const testIds = renderedTestIds();

      expect(testIds[0]).toBe('time-option-13-15');
      expect(testIds).not.toContain('time-option-13-00');
      expect(testIds).not.toContain('time-option-09-00');
    });

    it('[P1] should apply no now-filter for future dates', async () => {
      await createComponent({ date: '2026-08-25' });

      expect(renderedTestIds()[0]).toBe('time-option-09-00');
    });

    it('[P1] should refetch through the service keyed on the current date + party', async () => {
      await createComponent({ partySize: 2 });

      expect(bookingServiceSpy.getPublicBookings).toHaveBeenCalledWith('rest-123', '2026-08-21');

      fixture.componentRef.setInput('partySize', 5);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(bookingServiceSpy.getPublicBookings).toHaveBeenCalledTimes(2);
    });
  });

  describe('FETCH_ERROR', () => {
    it('[P0] should show the error copy with retry when the projections query rejects', async () => {
      await createComponent({ reject: true });

      expect(queryEl().textContent).toContain('Something went wrong.');
      expect(queryEl().textContent).toContain('Please try again.');
      expect(queryEl().querySelector('[data-testid="time-retry"]')).toBeTruthy();
      expect(queryEl().querySelectorAll('.pill')).toHaveLength(0);
    });

    it('[P0] should refetch the current selections when retry is clicked', async () => {
      await createComponent({ reject: true });

      bookingSpyResolve([]);
      queryEl().querySelector<HTMLButtonElement>('[data-testid="time-retry"]')!.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(bookingServiceSpy.getPublicBookings).toHaveBeenCalledTimes(2);
      expect(queryEl().querySelector('[data-testid="time-retry"]')).toBeFalsy();
      expect(queryEl().querySelectorAll('.pill').length).toBeGreaterThan(0);
    });
  });

  describe('BACK_NAVIGATION', () => {
    it('[P1] should emit back when the back button is tapped', async () => {
      await createComponent();

      let backCount = 0;
      fixture.componentInstance.back.subscribe(() => backCount++);

      queryEl().querySelector<HTMLButtonElement>('[data-testid="time-back"]')!.click();
      fixture.detectChanges();

      expect(backCount).toBe(1);
    });
  });
});
