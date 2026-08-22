import type { DayNumber, OpeningHours } from '../../shared/types/restaurant';

export interface ZonedToday {
  /** Calendar date in the target timezone, formatted as YYYY-MM-DD. */
  iso: string;
  /** ISO day number of that date: 1=Monday .. 7=Sunday. */
  dayNumber: DayNumber;
}

export interface CalendarCell {
  /** Calendar date formatted as YYYY-MM-DD. */
  iso: string;
  /** ISO day number of the date: 1=Monday .. 7=Sunday. */
  dayNumber: DayNumber;
  /** Always true — closed and past days are omitted from the grid entirely. */
  selectable: boolean;
}

/** Parses a YYYY-MM-DD string into its UTC date parts. */
function parseIso(iso: string): { year: number; month: number; day: number } {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
}

/** Derives the ISO day number (1=Mon..7=Sun) from a YYYY-MM-DD string via a UTC-constructed date. */
export function isoDayNumberOf(iso: string): DayNumber {
  const { year, month, day } = parseIso(iso);
  const utcDayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return (((utcDayOfWeek + 6) % 7) + 1) as DayNumber;
}

/**
 * Resolves "today" in the restaurant's IANA timezone (never device-local getters).
 * `now` must be injected by the caller. An invalid/unsupported timezone falls
 * back to UTC-derived date parts instead of throwing on corrupt restaurant data.
 */
export function zonedToday(timezone: string, now: Date): ZonedToday {
  try {
    const iso = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    return { iso, dayNumber: isoDayNumberOf(iso) };
  } catch {
    const iso = now.toISOString().slice(0, 10);
    return { iso, dayNumber: isoDayNumberOf(iso) };
  }
}

/** A date is open when its weekday has an entry in `hours` (missing key = closed). */
export function isOpenOn(hours: OpeningHours, iso: string): boolean {
  return hours[isoDayNumberOf(iso)] !== undefined;
}

/**
 * Builds the selectable cells for one month (month is 1-based: January = 1).
 * Only open AND today-or-future dates (compared against `todayIso`) are returned;
 * closed and past days are omitted entirely so they never reach the DOM.
 */
export function buildMonthGrid(
  year: number,
  month: number,
  hours: OpeningHours,
  todayIso: string,
): CalendarCell[] {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const mm = String(month).padStart(2, '0');
  const cells: CalendarCell[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${year}-${mm}-${String(day).padStart(2, '0')}`;
    if (iso < todayIso) continue;
    if (!isOpenOn(hours, iso)) continue;
    cells.push({ iso, dayNumber: isoDayNumberOf(iso), selectable: true });
  }

  return cells;
}
