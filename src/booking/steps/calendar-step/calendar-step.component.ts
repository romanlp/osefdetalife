import {
  AfterViewInit,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { OpeningHours } from '../../../shared/types/restaurant';
import { buildMonthGrid, zonedToday } from '../../utils/calendar';
import { NOW } from '../../utils/clock';

@Component({
  selector: 'osef-calendar-step',
  templateUrl: './calendar-step.component.html',
  styleUrl: './calendar-step.component.scss',
})
export class CalendarStepComponent implements AfterViewInit {
  readonly hours = input.required<OpeningHours>();
  readonly timezone = input.required<string>();
  readonly selected = input<string | null>(null);

  readonly dateSelect = output<string>();
  readonly back = output<void>();

  private readonly now = inject(NOW);
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('heading');

  /** Bumped on month navigation so "today" is re-derived after long idle periods. */
  private readonly navTick = signal(0);

  /** Sighted-only weekday context above the grid (aria-hidden in the template). */
  readonly weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

  /**
   * Today in the restaurant timezone. Re-derived whenever the timezone changes
   * or the user navigates months — a tab parked across midnight catches up at
   * the next navigation instead of keeping yesterday selectable forever.
   */
  readonly today = computed(() => {
    this.navTick();
    return zonedToday(this.timezone(), this.now());
  });

  /** Month offset implied by the selected date, or null when nothing is selected yet. */
  private readonly selectedMonthOffset = computed<number | null>(() => {
    const selected = this.selected();
    if (!selected) return null;
    const [todayYear, todayMonth] = this.today().iso.split('-').map(Number);
    const [selectedYear, selectedMonth] = selected.split('-').map(Number);
    return (selectedYear - todayYear) * 12 + (selectedMonth - todayMonth);
  });

  /** Explicit user navigation; null until prev/next is clicked. */
  private readonly userMonthOffset = signal<number | null>(null);

  /**
   * Effective month offset from the current month (0 = current). Before the
   * user navigates, a selection beyond the current month anchors the view to
   * its own month so back-navigation keeps the highlighted date visible.
   */
  readonly monthOffset = computed(() =>
    Math.max(0, this.userMonthOffset() ?? this.selectedMonthOffset() ?? 0),
  );

  private readonly view = computed(() => {
    const [year, month] = this.today().iso.split('-').map(Number);
    const anchor = new Date(Date.UTC(year, month - 1 + this.monthOffset(), 1));
    return { year: anchor.getUTCFullYear(), month: anchor.getUTCMonth() + 1 };
  });

  readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(
      new Date(Date.UTC(this.view().year, this.view().month - 1, 1)),
    ),
  );

  /** Open, today-or-future dates only — closed/past days never reach the DOM. */
  readonly cells = computed(() =>
    buildMonthGrid(this.view().year, this.view().month, this.hours(), this.today().iso),
  );

  /**
   * Non-interactive placeholders keeping the first date under its weekday
   * header — closed/past days are omitted from the grid, so without these the
   * remaining buttons pack flush-left and drift under the wrong labels.
   */
  readonly leadingSpacers = computed(() => {
    const firstDay = this.cells()[0]?.dayNumber ?? 1;
    return Array.from({length: Math.max(0, firstDay - 1)});
  });

  ngAfterViewInit(): void {
    this.heading().nativeElement.focus();
  }

  prev(): void {
    this.userMonthOffset.set(Math.max(0, this.monthOffset() - 1));
    this.navTick.update((tick) => tick + 1);
  }

  next(): void {
    this.userMonthOffset.set(this.monthOffset() + 1);
    this.navTick.update((tick) => tick + 1);
  }

  choose(iso: string): void {
    this.dateSelect.emit(iso);
  }

  dayOfMonth(iso: string): number {
    return Number(iso.slice(8, 10));
  }

  dateLabel(iso: string): string {
    const [year, month, day] = iso.split('-').map(Number);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(Date.UTC(year, month - 1, day)));
  }
}
