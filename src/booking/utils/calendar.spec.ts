import { describe, expect, it } from 'vitest';
import {
  buildMonthGrid,
  isoDayNumberOf,
  isOpenOn,
  zonedToday,
} from './calendar';
import type { OpeningHours } from '../../shared/types/restaurant';

/** Mon, Tue, Wed open; Thu–Sun closed. */
const HOURS_MON_WED: OpeningHours = {
  1: { open: '09:00', close: '17:00' },
  2: { open: '09:00', close: '17:00' },
  3: { open: '09:00', close: '17:00' },
};

/** Every day open. */
const HOURS_ALL_WEEK: OpeningHours = {
  1: { open: '09:00', close: '17:00' },
  2: { open: '09:00', close: '17:00' },
  3: { open: '09:00', close: '17:00' },
  4: { open: '09:00', close: '17:00' },
  5: { open: '09:00', close: '17:00' },
  6: { open: '09:00', close: '17:00' },
  7: { open: '09:00', close: '17:00' },
};

describe('zonedToday', () => {
  it('[P0] should derive the ISO date and day number in the restaurant timezone', () => {
    // 2026-08-20T23:30Z is already Friday Aug 21 in London (BST) but still Thursday Aug 20 in New York.
    const now = new Date('2026-08-20T23:30:00Z');

    expect(zonedToday('Europe/London', now)).toEqual({ iso: '2026-08-21', dayNumber: 5 });
    expect(zonedToday('America/New_York', now)).toEqual({ iso: '2026-08-20', dayNumber: 4 });
  });

  it('[P1] should map each weekday to its ISO day number (1=Mon..7=Sun)', () => {
    const expectations: [string, string][] = [
      ['2026-08-17', '1'], // Monday
      ['2026-08-18', '2'],
      ['2026-08-19', '3'],
      ['2026-08-20', '4'],
      ['2026-08-21', '5'],
      ['2026-08-22', '6'],
      ['2026-08-23', '7'], // Sunday
    ];

    for (const [iso, dayNumber] of expectations) {
      expect(isoDayNumberOf(iso)).toBe(Number(dayNumber));
    }
  });

  it('TZ_BOUNDARY: should not depend on the device-local timezone for the date boundary', () => {
    // One minute before London midnight vs one minute after — the ISO date must flip on the zoned boundary.
    const beforeMidnight = new Date('2026-08-20T22:59:00Z');
    const afterMidnight = new Date('2026-08-20T23:01:00Z');

    expect(zonedToday('Europe/London', beforeMidnight).iso).toBe('2026-08-20');
    expect(zonedToday('Europe/London', afterMidnight).iso).toBe('2026-08-21');
  });

  it('TZ_BOUNDARY: should fall back to UTC-derived date parts when the timezone is invalid', () => {
    // Corrupt restaurant data must not crash the date step; UTC parts, never device-local getters.
    const now = new Date('2026-08-20T23:30:00Z');

    expect(zonedToday('Not/ARealZone', now)).toEqual({ iso: '2026-08-20', dayNumber: 4 });
    expect(zonedToday('', now)).toEqual({ iso: '2026-08-20', dayNumber: 4 });
  });
});

describe('isOpenOn', () => {
  it('[P0] should return true when the weekday has hours and false when the key is missing', () => {
    expect(isOpenOn(HOURS_MON_WED, '2026-08-17')).toBe(true); // Monday
    expect(isOpenOn(HOURS_MON_WED, '2026-08-22')).toBe(false); // Saturday
    expect(isOpenOn(HOURS_MON_WED, '2026-08-23')).toBe(false); // Sunday
  });

  it('[P0] should treat an empty hours record as always closed', () => {
    expect(isOpenOn({}, '2026-08-17')).toBe(false);
  });
});

describe('buildMonthGrid', () => {
  it('[P0] should return only open dates from today onward as selectable cells', () => {
    // August 2026: Aug 1 is a Saturday; Mon–Wed are open.
    const cells = buildMonthGrid(2026, 8, HOURS_MON_WED, '2026-08-05');

    expect(cells.map((c) => c.iso)).toEqual([
      '2026-08-05',
      '2026-08-10',
      '2026-08-11',
      '2026-08-12',
      '2026-08-17',
      '2026-08-18',
      '2026-08-19',
      '2026-08-24',
      '2026-08-25',
      '2026-08-26',
      '2026-08-31',
    ]);
    expect(cells.every((c) => c.selectable)).toBe(true);
    expect(cells.every((c) => c.dayNumber >= 1 && c.dayNumber <= 3)).toBe(true);
  });

  it('DAY_HIDDEN: should omit past-but-open days entirely', () => {
    const cells = buildMonthGrid(2026, 8, HOURS_ALL_WEEK, '2026-08-20');

    expect(cells[0]?.iso).toBe('2026-08-20');
    expect(cells.some((c) => c.iso < '2026-08-20')).toBe(false);
  });

  it('DAY_HIDDEN: should include today itself when open', () => {
    const cells = buildMonthGrid(2026, 8, HOURS_ALL_WEEK, '2026-08-21');

    expect(cells.map((c) => c.iso)).toContain('2026-08-21');
  });

  it('MONTH_NAV: should handle a month with zero selectable days by returning an empty grid', () => {
    const cells = buildMonthGrid(2026, 2, {}, '2026-01-01');

    expect(cells).toEqual([]);
  });

  it('[P1] should compute the correct number of days for 31-day months and February', () => {
    const january = buildMonthGrid(2026, 1, HOURS_ALL_WEEK, '2026-01-01');
    const february2028 = buildMonthGrid(2028, 2, HOURS_ALL_WEEK, '2028-02-01'); // leap year

    expect(january).toHaveLength(31);
    expect(february2028).toHaveLength(29);
    expect(january.at(-1)?.iso).toBe('2026-01-31');
    expect(february2028.at(-1)?.iso).toBe('2028-02-29');
  });
});
