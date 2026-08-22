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

  /** 0 = current month (in the restaurant timezone); prev is disabled there. */
  readonly monthOffset = signal(0);

  /** Sighted-only weekday context above the grid (aria-hidden in the template). */
  readonly weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

  private readonly today = computed(() => zonedToday(this.timezone(), this.now()));

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

  ngAfterViewInit(): void {
    this.heading().nativeElement.focus();
  }

  prev(): void {
    this.monthOffset.update((offset) => Math.max(0, offset - 1));
  }

  next(): void {
    this.monthOffset.update((offset) => offset + 1);
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
