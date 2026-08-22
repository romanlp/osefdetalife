import { Service, signal } from '@angular/core';

export type BookingFlowStep = 'landing' | 'party-size' | 'date' | 'time';

/**
 * Signal-driven state machine for the booking flow (Stories 2.2–2.5).
 * Selections are ephemeral until final submit — no URL/guard plumbing.
 */
@Service()
export class BookingFlowService {
  readonly step = signal<BookingFlowStep>('landing');
  readonly partySize = signal<number | null>(null);
  readonly selectedDate = signal<string | null>(null);

  /** Landing → party size. */
  start(): void {
    this.step.set('party-size');
  }

  /** Party size selected → auto-advance to the calendar. Selections are never deselected. */
  choosePartySize(size: number): void {
    this.partySize.set(size);
    this.step.set('date');
  }

  /** Date selected → auto-advance to the time-slot step. */
  chooseDate(iso: string): void {
    this.selectedDate.set(iso);
    this.step.set('time');
  }

  /**
   * One step back, preserving all selections (BACK_PRESERVES).
   * No-op on landing.
   */
  back(): void {
    const previous: Partial<Record<BookingFlowStep, BookingFlowStep>> = {
      'party-size': 'landing',
      date: 'party-size',
      time: 'date',
    };
    const target = previous[this.step()];
    if (target) this.step.set(target);
  }

  /** Clears the whole flow — called when the restaurant is (re)loaded. */
  reset(): void {
    this.step.set('landing');
    this.partySize.set(null);
    this.selectedDate.set(null);
  }
}
