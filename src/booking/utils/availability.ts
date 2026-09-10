import {
  BOOKING_DURATION_MINUTES,
  type PublicBookingProjection,
} from '../../shared/types/booking';
import type { DayHours, OpeningHours, TableGroup } from '../../shared/types/restaurant';
import { isoDayNumberOf } from './calendar';

/** Angular dev-mode flag — defined globally by the framework, absent in production builds. */
declare const ngDevMode: boolean | object | undefined;

/** Parses an "HH:mm" (or "H:mm") clock string into minutes since midnight. */
export function clockMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Formats minutes-since-midnight as a zero-padded "HH:mm" string. */
export function minutesToClock(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Every 15-minute slot start within open→close for that day's hours.
 * Closed days yield no slots. Raw grid only — capacity/occupancy/past
 * filtering happens in `availableSlots`.
 */
export function slotsForDay(hours: OpeningHours, iso: string): string[] {
  const dayHours = hours[isoDayNumberOf(iso)];
  if (!dayHours) return [];

  const slots: string[] = [];
  for (let m = clockMinutes(dayHours.open); m <= clockMinutes(dayHours.close); m += 15) {
    slots.push(minutesToClock(m));
  }
  return slots;
}

export interface AvailabilityInput {
  hours: OpeningHours;
  /** YYYY-MM-DD of the requested day. */
  iso: string;
  /** That restaurant+day's confirmed public projections. */
  bookings: PublicBookingProjection[];
  partySize: number;
  tableGroups: TableGroup[];
  /**
   * Minutes since midnight in the restaurant timezone when `iso` is today,
   * or null for any other date. "now" is always injected by the caller —
   * this function never reads the clock.
   */
  nowMinutes: number | null;
}

/** Two half-open windows `[a, a+dur)` and `[b, b+dur)` intersect. */
function overlaps(aStart: number, bStart: number, dur: number): boolean {
  return aStart < bStart + dur && bStart < aStart + dur;
}

interface SeatedBooking {
  partySize: number;
  startMinutes: number;
}

/**
 * Bookable slot starts ("HH:mm", ascending) for one day:
 * raw 15-min grid minus slots whose full `BOOKING_DURATION_MINUTES` window
 * would run past close, minus slots where no table of capacity ≥ partySize
 * stays free for that window given greedy best-fit seating of the day's
 * projected bookings, minus starts at/before now when the day is today.
 */
export function availableSlots({
  hours,
  iso,
  bookings,
  partySize,
  tableGroups,
  nowMinutes,
}: AvailabilityInput): string[] {
  const dayHours: DayHours | undefined = hours[isoDayNumberOf(iso)];
  if (!dayHours || !Number.isFinite(partySize) || partySize < 1) return [];
  const openMinutes = clockMinutes(dayHours.open);
  const closeMinutes = clockMinutes(dayHours.close);

  // Every physical table's capacity, smallest first (greedy best-fit order).
  const tables: number[] = tableGroups
    .filter((group) => group.count > 0)
    .flatMap((group) => Array.from({ length: group.count }, () => group.capacity))
    .sort((a, b) => a - b);
  if (!tables.some((capacity) => capacity >= partySize)) return [];

  const seated: SeatedBooking[] = bookings
    .filter((booking) => booking.status === 'confirmed')
    .map((booking) => ({ partySize: booking.partySize, startMinutes: clockMinutes(booking.time) }))
    .filter((booking) => Number.isFinite(booking.startMinutes))
    .sort((a, b) => a.startMinutes - b.startMinutes);

  // Per-table busy windows as [start, end) minute pairs.
  const busyWindows: [number, number][][] = tables.map(() => []);

  const tableFreeFor = (tableIndex: number, start: number): boolean =>
    busyWindows[tableIndex].every(
      ([busyStart, busyEnd]) => !overlaps(start, busyStart, busyEnd - busyStart),
    );

  // Greedy assignment in Design Notes: seat each booking at the first
  // (smallest adequate) table free across its whole window. Parties seat at
  // ANY adequate physical table — small parties consume small tables first
  // and never distort larger pools unless the small ones are full.
  for (const booking of seated) {
    const index = tables.findIndex(
      (capacity, i) => capacity >= booking.partySize && tableFreeFor(i, booking.startMinutes),
    );
    if (index !== -1) {
      busyWindows[index].push([
        booking.startMinutes,
        booking.startMinutes + BOOKING_DURATION_MINUTES,
      ]);
    }
  }

  const fitsParty = (tableIndex: number): boolean => tables[tableIndex] >= partySize;

  const slots: string[] = [];
  for (let m = openMinutes; m <= closeMinutes; m += 15) {
    if (nowMinutes !== null && m <= nowMinutes) continue;
    if (m + BOOKING_DURATION_MINUTES > closeMinutes) continue;
    if (
      tables.some((_, i) => fitsParty(i) && tableFreeFor(i, m))
    ) {
      slots.push(minutesToClock(m));
    }
  }
  return slots;
}

/**
 * Minutes-since-midnight "now" in the restaurant's IANA timezone via Intl
 * (never device-local getters). Invalid timezones fall back to UTC parts with
 * a dev-mode warning; a missing/NaN clock degrades to the epoch.
 */
export function zonedMinutesOfDay(timezone: string, now: Date): number {
  const safeNow = now instanceof Date && !Number.isNaN(now.getTime()) ? now : new Date(0);
  try {
    return clockMinutes(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(safeNow),
    );
  } catch {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      console.warn(`[osef] zonedMinutesOfDay: invalid timezone "${timezone}" — falling back to UTC.`);
    }
    return safeNow.getUTCHours() * 60 + safeNow.getUTCMinutes();
  }
}
