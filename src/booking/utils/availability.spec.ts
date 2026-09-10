import { describe, expect, it } from 'vitest';
import {
  availableSlots,
  clockMinutes,
  minutesToClock,
  slotsForDay,
  zonedMinutesOfDay,
} from './availability';
import type { PublicBookingProjection } from '../../shared/types/booking';
import type { OpeningHours, TableGroup } from '../../shared/types/restaurant';

/** Mon–Sun open 09:00–17:00 unless a case overrides. */
const HOURS_9_TO_17: OpeningHours = {
  1: { open: '09:00', close: '17:00' },
  2: { open: '09:00', close: '17:00' },
  3: { open: '09:00', close: '17:00' },
  4: { open: '09:00', close: '17:00' },
  5: { open: '09:00', close: '17:00' },
  6: { open: '09:00', close: '17:00' },
  7: { open: '09:00', close: '17:00' },
};

/** Late evening hours — exercises the duration-before-close tail. */
const HOURS_9_TO_23: OpeningHours = {
  1: { open: '09:00', close: '23:00' },
  2: { open: '09:00', close: '23:00' },
  3: { open: '09:00', close: '23:00' },
  4: { open: '09:00', close: '23:00' },
  5: { open: '09:00', close: '23:00' },
  6: { open: '09:00', close: '23:00' },
  7: { open: '09:00', close: '23:00' },
};

const CAP2_X2: TableGroup = { capacity: 2, count: 2 };
const CAP4_X3: TableGroup = { capacity: 4, count: 3 };
const CAP6_X1: TableGroup = { capacity: 6, count: 1 };
const CAP4_X1: TableGroup = { capacity: 4, count: 1 };

/** Tuesday — an ordinary open day. */
const TUESDAY = '2026-08-18';
/** Monday. */
const MONDAY = '2026-08-17';

function booking(overrides: Partial<PublicBookingProjection>): PublicBookingProjection {
  return {
    restaurantId: 'rest-1',
    date: TUESDAY,
    time: '19:00',
    partySize: 4,
    status: 'confirmed',
    ...overrides,
  };
}

function slots(overrides: Partial<Parameters<typeof availableSlots>[0]> = {}): string[] {
  return availableSlots({
    hours: HOURS_9_TO_17,
    iso: TUESDAY,
    bookings: [],
    partySize: 4,
    tableGroups: [CAP2_X2, CAP4_X3, CAP6_X1],
    nowMinutes: null,
    ...overrides,
  });
}

describe('HAPPY_PATH_SLOT', () => {
  it('[P0] should generate the full 15-minute grid across open→close for a free day', () => {
    const grid = slotsForDay(HOURS_9_TO_17, TUESDAY);

    expect(grid[0]).toBe('09:00');
    expect(grid.at(-1)).toBe('17:00');
    expect(grid).toHaveLength(33); // (8h × 4 per hour) + inclusive close endpoint
    expect(minutesToClock(clockMinutes('09:45'))).toBe('09:45');
  });

  it('[P0] should keep every window-fitting slot bookable when tables are free', () => {
    const result = slots();

    // Party of 4, cap-4 ×3 + cap-6 ×1 all free: every seating ending ≤ close survives.
    expect(result[0]).toBe('09:00');
    expect(result).toContain('12:15');
    expect(result.at(-1)).toBe('15:00'); // 15:00 + 120min ends exactly at the 17:00 close
    expect(result).toHaveLength(25);
  });

  it('[P1] should drop the tail a 120-minute window cannot cover before close', () => {
    const late = slots({ hours: HOURS_9_TO_23 });

    expect(late).toContain('21:00'); // ends exactly at the 23:00 close
    expect(late).not.toContain('21:15'); // would end 23:15 — past close
    expect(late.at(-1)).toBe('21:00');
  });

  it('[P1] should return [] for a closed day', () => {
    const closedHours: OpeningHours = {};
    expect(slotsForDay(closedHours, TUESDAY)).toEqual([]);
    expect(slots({ hours: closedHours })).toEqual([]);
  });
});

describe('OCCUPIED_WINDOW', () => {
  it('[P0] should remove every slot overlapping a confirmed 120-minute booking', () => {
    // Sole cap-4 table booked 19:00 occupies [19:00, 21:00): slots strictly
    // inside (17:00, 21:00) cannot fit another window around it.
    const result = slots({
      hours: HOURS_9_TO_23,
      tableGroups: [CAP4_X1],
      bookings: [booking({ time: '19:00', partySize: 4 })],
      partySize: 4,
    });

    expect(result[0]).toBe('09:00');
    expect(result).toContain('17:00'); // ends exactly when the booked window starts
    expect(result).not.toContain('17:15');
    expect(result).not.toContain('18:45');
    expect(result).not.toContain('19:00');
    expect(result).not.toContain('20:45');
    expect(result).toContain('21:00'); // starts exactly when the booked window ends
    expect(result.at(-1)).toBe('21:00');
  });

  it('[P0] should keep slots bookable when spare capacity remains in the pool', () => {
    // Three cap-4 tables; one 19:00 booking can only take one of them.
    const result = slots({
      hours: HOURS_9_TO_23,
      tableGroups: [CAP4_X3],
      bookings: [booking({ time: '19:00', partySize: 4 })],
      partySize: 4,
    });

    expect(result).toContain('19:00');
    expect(result).toContain('20:00');
  });

  it('[P1] should ignore cancelled projections', () => {
    const result = slots({
      hours: HOURS_9_TO_23,
      tableGroups: [CAP4_X1],
      bookings: [booking({ time: '19:00', status: 'cancelled' })],
      partySize: 4,
    });

    expect(result).toContain('19:00');
  });
});

describe('CAPACITY_SCARCITY', () => {
  it('[P0] should reflect only the qualifying table pool for large parties', () => {
    // Party of 6 → the single cap-6 table qualifies. Small parties seat at the
    // smallest adequate tables, so they never consume the six-top.
    const result = slots({
      hours: HOURS_9_TO_23,
      tableGroups: [CAP2_X2, CAP4_X3, CAP6_X1],
      bookings: [
        booking({ time: '10:00', partySize: 2 }),
        booking({ time: '11:00', partySize: 4 }),
        booking({ time: '19:00', partySize: 6 }),
      ],
      partySize: 6,
    });

    expect(result[0]).toBe('09:00');
    expect(result).toContain('12:30');
    expect(result).toContain('17:00');
    expect(result).not.toContain('17:15'); // blocked by the six-top's own 19:00 booking
    expect(result).not.toContain('20:45');
    expect(result).toContain('21:00');
    expect(result.at(-1)).toBe('21:00');
  });

  it('[P0] should return [] when no table group reaches the party size', () => {
    const result = slots({
      partySize: 8,
      tableGroups: [CAP2_X2, CAP4_X3, CAP6_X1],
    });

    expect(result).toEqual([]);
  });

  it('[P1] should seat greedy bookings smallest-adequate-first so big parties keep their table', () => {
    // A pair and a four-top arrive first; each takes its own smallest adequate table.
    const result = slots({
      hours: HOURS_9_TO_23,
      tableGroups: [
        { capacity: 2, count: 1 },
        { capacity: 4, count: 1 },
        CAP6_X1,
      ],
      bookings: [
        booking({ time: '19:00', partySize: 2 }),
        booking({ time: '19:00', partySize: 4 }),
      ],
      partySize: 6,
    });

    // Both earlier bookings sit on the cap-2/cap-4 tables; the six-top stays free at 19:00.
    expect(result).toContain('19:00');
    expect(result).toContain('18:15');
  });
});

describe('NO_TIMES', () => {
  it('[P0] should return [] when the qualifying table is booked back-to-back all day', () => {
    // Sole cap-6 table booked 09:00→17:00 in contiguous windows covers every
    // candidate slot the window rule allows.
    const result = slots({
      tableGroups: [CAP6_X1],
      bookings: [
        booking({ time: '09:00', partySize: 6 }),
        booking({ time: '11:00', partySize: 6 }),
        booking({ time: '13:00', partySize: 6 }),
        booking({ time: '15:00', partySize: 6 }),
      ],
      partySize: 6,
    });

    expect(result).toEqual([]);
  });

  it('[P0] should return [] for today after close', () => {
    const result = slots({ nowMinutes: clockMinutes('18:00') });

    expect(result).toEqual([]);
  });
});

describe('TODAY_PAST_SLOTS', () => {
  it('[P0] should exclude slots starting at or before now but keep later ones', () => {
    const result = slots({ nowMinutes: clockMinutes('13:00') });

    expect(result[0]).toBe('13:15');
    expect(result).not.toContain('13:00');
    expect(result).not.toContain('09:00');
  });

  it('[P1] should apply no now-filter when the date is not today (nowMinutes null)', () => {
    const result = slots({ nowMinutes: null });

    expect(result[0]).toBe('09:00');
  });
});

describe('EDGE_CASE', () => {
  it('[P1] should tolerate non-padded legacy times and skip malformed ones without throwing', () => {
    const result = slots({
      hours: HOURS_9_TO_23,
      tableGroups: [CAP4_X1],
      bookings: [
        booking({ time: '9:00', partySize: 4 }), // non-padded hour
        booking({ time: 'oops', partySize: 4 }), // unparseable — ignored entirely
      ],
      partySize: 4,
    });

    // "9:00" occupies [09:00, 11:00): slots 09:00–10:45 vanish, 11:00 returns.
    expect(result).not.toContain('09:00');
    expect(result).not.toContain('10:45');
    expect(result).toContain('11:00');
    expect(result).toContain('21:00');
  });

  it('[P1] should derive minutes-of-day via Intl in the restaurant timezone, never device-local', () => {
    // 2026-08-20T23:30Z is 00:30 (next day) in London but 19:30 in New York.
    const now = new Date('2026-08-20T23:30:00Z');

    expect(zonedMinutesOfDay('Europe/London', now)).toBe(30);
    expect(zonedMinutesOfDay('America/New_York', now)).toBe(19 * 60 + 30);
  });

  it('[P1] should degrade to UTC minutes for an invalid timezone instead of throwing', () => {
    const now = new Date('2026-08-20T23:30:00Z');

    expect(zonedMinutesOfDay('Not/ARealZone', now)).toBe(23 * 60 + 30);
  });

  it('[P1] should round-trip clock strings through minute math', () => {
    expect(clockMinutes('00:00')).toBe(0);
    expect(clockMinutes('23:59')).toBe(23 * 60 + 59);
    expect(minutesToClock(0)).toBe('00:00');
    expect(minutesToClock(1439)).toBe('23:59');
    expect(minutesToClock(540)).toBe('09:00');
  });

  it('[P1] should ignore projections with missing time or non-positive partySize', () => {
    const result = slots({
      hours: HOURS_9_TO_23,
      tableGroups: [CAP4_X1],
      bookings: [
        booking({ time: '10:00', partySize: 0 }),
        booking({ time: '11:00', partySize: -2 }),
        { ...booking({ time: '12:00', partySize: 4 }), time: undefined as unknown as string },
      ],
      partySize: 4,
    });

    // None of the corrupt projections occupies a table — the whole grid stays bookable.
    expect(result[0]).toBe('09:00');
    expect(result.at(-1)).toBe('21:00');
  });

  it('[P1] should treat a NaN now-filter as no filter instead of leaking past slots', () => {
    const result = slots({ nowMinutes: NaN });

    expect(result[0]).toBe('09:00');
  });
});

describe('WEEKDAY_KEYING', () => {
  it('[P1] should key the grid off the requested ISO date, not a hardcoded weekday', () => {
    expect(slotsForDay(HOURS_9_TO_17, MONDAY)[0]).toBe('09:00');

    const mondayOnly: OpeningHours = { 1: { open: '10:00', close: '12:00' } };
    expect(slotsForDay(mondayOnly, MONDAY)).toEqual([
      '10:00',
      '10:15',
      '10:30',
      '10:45',
      '11:00',
      '11:15',
      '11:30',
      '11:45',
      '12:00',
    ]);
    expect(slotsForDay(mondayOnly, TUESDAY)).toEqual([]);
  });
});
