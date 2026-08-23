import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarStepComponent } from './calendar-step.component';
import { NOW } from '../../utils/clock';
import type { OpeningHours } from '../../../shared/types/restaurant';

/** Open every day except Monday (ISO day 1). */
const HOURS_CLOSED_MONDAY: OpeningHours = {
  2: { open: '09:00', close: '17:00' },
  3: { open: '09:00', close: '17:00' },
  4: { open: '09:00', close: '17:00' },
  5: { open: '09:00', close: '17:00' },
  6: { open: '09:00', close: '17:00' },
  7: { open: '09:00', close: '17:00' },
};

/** Thursday 2026-08-20 at 23:30 UTC — already Friday Aug 21 in London, still Aug 20 in New York. */
const FIXED_NOW = () => new Date('2026-08-20T23:30:00Z');

describe('CalendarStepComponent', () => {
  let fixture: ComponentFixture<CalendarStepComponent>;

  function queryEl(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  async function createComponent(
    overrides: {
      selected?: string | null;
      timezone?: string;
      hours?: OpeningHours;
      now?: () => Date;
    } = {},
  ): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [CalendarStepComponent],
      providers: [{ provide: NOW, useValue: overrides.now ?? FIXED_NOW }],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarStepComponent);
    fixture.componentRef.setInput('hours', overrides.hours ?? HOURS_CLOSED_MONDAY);
    fixture.componentRef.setInput('timezone', overrides.timezone ?? 'Europe/London');
    fixture.componentRef.setInput('selected', overrides.selected ?? null);
    fixture.detectChanges();
  }

  describe('HAPPY_PATH', () => {
    it('[P0] should render the heading, month label, and only open dates from today onward', async () => {
      await createComponent();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('h2')?.textContent).toContain('Pick a date');
      expect(el.textContent).toContain('August 2026');

      // "Today" is Fri 2026-08-21 in Europe/London; Mondays (17, 24, 31) hidden as closed.
      const rendered = [...el.querySelectorAll<HTMLButtonElement>('.date-btn')].map(
        (b) => b.getAttribute('data-testid'),
      );
      expect(rendered).toEqual([
        'date-option-2026-08-21',
        'date-option-2026-08-22',
        'date-option-2026-08-23',
        'date-option-2026-08-25',
        'date-option-2026-08-26',
        'date-option-2026-08-27',
        'date-option-2026-08-28',
        'date-option-2026-08-29',
        'date-option-2026-08-30',
      ]);
    });

    it('[P0] should emit the ISO date when an open date is tapped', async () => {
      await createComponent();

      const emitted: string[] = [];
      fixture.componentInstance.dateSelect.subscribe((iso) => emitted.push(iso));

      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="date-option-2026-08-21"]')!
        .click();
      fixture.detectChanges();

      expect(emitted).toEqual(['2026-08-21']);
    });
  });

  describe('GRID_ALIGNMENT', () => {
    it('[P0] should place the first selectable date under its weekday header via leading spacers', async () => {
      await createComponent();

      // First open day is Fri 2026-08-21 (ISO day 5) → four placeholder columns before it.
      expect(queryEl().querySelectorAll('.grid .spacer')).toHaveLength(4);
    });

    it('[P1] should realign spacers when navigating to a month starting midweek', async () => {
      await createComponent();

      // September 2026 starts on a Tuesday (ISO day 2) → one spacer.
      queryEl().querySelector<HTMLButtonElement>('[data-testid="calendar-next"]')!.click();
      fixture.detectChanges();

      expect(queryEl().querySelectorAll('.grid .spacer')).toHaveLength(1);
      expect(
        queryEl().querySelector('.grid .date-btn')?.getAttribute('data-testid'),
      ).toBe('date-option-2026-09-01');
    });
  });

  describe('DAY_HIDDEN', () => {
    it('[P0] should omit past-but-open days entirely', async () => {
      await createComponent();

      // Wednesday 2026-08-19 is open but before today (2026-08-21 in London).
      expect(
        queryEl().querySelector('[data-testid="date-option-2026-08-19"]'),
      ).toBeFalsy();
    });

    it('[P0] should omit closed weekdays entirely, including future ones', async () => {
      await createComponent();

      // Monday 2026-08-24 is in the future but closed.
      expect(
        fixture.nativeElement.querySelector('[data-testid="date-option-2026-08-24"]'),
      ).toBeFalsy();
    });
  });

  describe('MONTH_NAV', () => {
    it('[P0] should disable prev on the current month and enable it after navigating forward', async () => {
      await createComponent();

      const prev = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="calendar-prev"]',
      )!;
      const next = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="calendar-next"]',
      )!;

      expect(prev.disabled).toBe(true);

      next.click();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('September 2026');
      expect(prev.disabled).toBe(false);

      prev.click();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('August 2026');
      expect(prev.disabled).toBe(true);
    });

    it('[P1] should rebuild the grid for the viewed month', async () => {
      await createComponent();

      queryEl().querySelector<HTMLButtonElement>('[data-testid="calendar-next"]')!.click();
      fixture.detectChanges();

      const rendered = [
        ...queryEl().querySelectorAll<HTMLButtonElement>('.date-btn'),
      ].map((b) => b.getAttribute('data-testid'));

      // September 2026: Sep 1 is a Tuesday; Mondays (7, 14, 21, 28) hidden.
      expect(rendered[0]).toBe('date-option-2026-09-01');
      expect(rendered).not.toContain('date-option-2026-09-07');
      expect(rendered.at(-1)).toBe('date-option-2026-09-30');
    });

    it('[P0] YEAR_BOUNDARY: should roll navigation from December 2026 into January 2027', async () => {
      await createComponent({ now: () => new Date('2026-12-28T12:00:00Z') });

      expect(queryEl().textContent).toContain('December 2026');

      queryEl().querySelector<HTMLButtonElement>('[data-testid="calendar-next"]')!.click();
      fixture.detectChanges();

      expect(queryEl().textContent).toContain('January 2027');

      const rendered = [
        ...queryEl().querySelectorAll<HTMLButtonElement>('.date-btn'),
      ].map((b) => b.getAttribute('data-testid'));

      // Jan 1 2027 is a Friday — first cell, correctly placed in the week.
      expect(rendered[0]).toBe('date-option-2027-01-01');
      // Mondays (4, 11, 18, 25) hidden as closed across the new year.
      expect(rendered).not.toContain('date-option-2027-01-04');
      expect(rendered).not.toContain('date-option-2027-01-11');
      expect(rendered).not.toContain('date-option-2027-01-18');
      expect(rendered).not.toContain('date-option-2027-01-25');
      // Jan 31 2027 is a Sunday (open) — the grid reaches the true end of month.
      expect(rendered.at(-1)).toBe('date-option-2027-01-31');
    });
  });

  describe('EMPTY_MONTH', () => {
    it('[P1] should show the empty-state message when the viewed month has zero selectable dates', async () => {
      await createComponent({ hours: {} });

      expect(queryEl().querySelectorAll('.date-btn')).toHaveLength(0);
      const empty = queryEl().querySelector('[data-testid="calendar-empty"]');
      expect(empty?.textContent?.trim()).toBe('No available dates in this month.');
    });

    it('[P1] should keep forward navigation unbounded while a month is empty', async () => {
      await createComponent({ hours: {} });

      queryEl().querySelector<HTMLButtonElement>('[data-testid="calendar-next"]')!.click();
      fixture.detectChanges();

      expect(
        queryEl().querySelector<HTMLButtonElement>('[data-testid="calendar-prev"]')!.disabled,
      ).toBe(false);

      // No cap: stepping forward again renders another (empty) month just fine.
      queryEl().querySelector<HTMLButtonElement>('[data-testid="calendar-next"]')!.click();
      fixture.detectChanges();

      expect(queryEl().querySelector('[data-testid="calendar-empty"]')).toBeTruthy();
    });
  });

  describe('SELECTION_STATE', () => {
    it('[P1] should highlight the selected date when returning via back navigation', async () => {
      await createComponent({ selected: '2026-08-21' });

      const selected = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="date-option-2026-08-21"]',
      )!;
      const unselected = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="date-option-2026-08-22"]',
      )!;

      expect(selected.classList.contains('selected')).toBe(true);
      expect(selected.getAttribute('aria-pressed')).toBe('true');
      expect(unselected.classList.contains('selected')).toBe(false);
    });

    it('[P0] should open on the selected month when the selection lies beyond the current month', async () => {
      // Returning from a later step remounts this component; the view must anchor
      // to October (the selection's month), not snap back to August.
      await createComponent({ selected: '2026-10-02' });

      expect(queryEl().textContent).toContain('October 2026');
      const selected = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="date-option-2026-10-02"]',
      )!;
      expect(selected.classList.contains('selected')).toBe(true);
      expect(selected.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('TODAY_MARKER', () => {
    it('[P1] should mark today with a visual treatment and aria-current="date"', async () => {
      await createComponent();

      const todayCell = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="date-option-2026-08-21"]',
      )!;
      const otherCell = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="date-option-2026-08-25"]',
      )!;

      expect(todayCell.classList.contains('today')).toBe(true);
      expect(todayCell.getAttribute('aria-current')).toBe('date');
      expect(otherCell.classList.contains('today')).toBe(false);
      expect(otherCell.getAttribute('aria-current')).toBeNull();
    });
  });

  describe('BACK_NAVIGATION', () => {
    it('[P1] should emit back when the back button is tapped', async () => {
      await createComponent();

      let backCount = 0;
      fixture.componentInstance.back.subscribe(() => backCount++);

      queryEl().querySelector<HTMLButtonElement>('[data-testid="calendar-back"]')!.click();
      fixture.detectChanges();

      expect(backCount).toBe(1);
    });
  });

  describe('FOCUS_MANAGEMENT', () => {
    it('[P0] should move focus to the step heading on init', async () => {
      await createComponent();

      const heading = queryEl().querySelector<HTMLHeadingElement>('h2')!;
      expect(document.activeElement).toBe(heading);
      expect(heading.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('TZ_BOUNDARY', () => {
    it('[P1] should derive "today" from the restaurant timezone, not the device clock', async () => {
      // 2026-08-20T23:30Z is already Fri Aug 21 in London but still Thu Aug 20 in New York.
      await createComponent({ timezone: 'America/New_York' });

      expect(
        fixture.nativeElement.querySelector('[data-testid="date-option-2026-08-20"]'),
      ).toBeTruthy();

      fixture.componentRef.setInput('timezone', 'Europe/London');
      fixture.detectChanges();

      expect(
        fixture.nativeElement.querySelector('[data-testid="date-option-2026-08-20"]'),
      ).toBeFalsy();
      expect(
        fixture.nativeElement.querySelector('[data-testid="date-option-2026-08-21"]'),
      ).toBeTruthy();
    });

    it('[P1] should refresh "today" when navigating months after midnight passes', async () => {
      let instant = new Date('2026-08-20T23:30:00Z');
      await createComponent({ now: () => instant });

      // Fri Aug 21 is selectable before London midnight passes.
      expect(
        queryEl().querySelector('[data-testid="date-option-2026-08-21"]'),
      ).toBeTruthy();

      instant = new Date('2026-08-21T23:30:00Z'); // already Sat Aug 22 in Europe/London
      queryEl().querySelector<HTMLButtonElement>('[data-testid="calendar-next"]')!.click();
      fixture.detectChanges();
      queryEl().querySelector<HTMLButtonElement>('[data-testid="calendar-prev"]')!.click();
      fixture.detectChanges();

      // Today is now Sat Aug 22 — Aug 21 dropped as a past day.
      expect(
        queryEl().querySelector('[data-testid="date-option-2026-08-21"]'),
      ).toBeFalsy();
      expect(
        queryEl().querySelector('[data-testid="date-option-2026-08-22"]'),
      ).toBeTruthy();
    });
  });
});
