import { Service, signal } from '@angular/core';

export type BookingFlowStep = 'landing' | 'party-size' | 'date' | 'time' | 'details' | 'confirmation';

/** Diner input captured on the details step — held by the flow so back → forward restores it. */
export interface DetailsDraft {
  name: string;
  email: string;
  custom: string;
}

const EMPTY_DETAILS: DetailsDraft = { name: '', email: '', custom: '' };

/** One step back, preserving all selections. Landing and confirmation have no target. */
const BACK_TARGET: Partial<Record<BookingFlowStep, BookingFlowStep>> = {
  'party-size': 'landing',
  date: 'party-size',
  time: 'date',
  details: 'time',
};

/**
 * Signal-driven state machine for the booking flow (Stories 2.2–2.5).
 * Selections are ephemeral until final submit — no URL/guard plumbing.
 *
 * Every transition is origin-guarded: invoked from an unexpected step it is a
 * no-op rather than a skip, so out-of-order callers cannot jump the funnel.
 */
@Service()
export class BookingFlowService {
  readonly step = signal<BookingFlowStep>('landing');
  readonly partySize = signal<number | null>(null);
  readonly selectedDate = signal<string | null>(null);
  readonly selectedSlot = signal<string | null>(null);

  /**
   * Transition-busy flag (Story 2.5). Raised by an incoming step while its own
   * work is in flight — today only the time step's availability fetch — and
   * cleared when that work resolves or rejects. Deliberately fetch-coupled:
   * no minimum-display timer ever makes it perceivable.
   */
  readonly transitionBusy = signal(false);

  /** Details draft, restored when the diner returns to the details step. */
  private readonly details = signal<DetailsDraft>({ ...EMPTY_DETAILS });
  readonly detailsDraft = this.details.asReadonly();

  /** Landing → party size. */
  start(): void {
    if (this.step() !== 'landing') return;
    this.enter('party-size');
  }

  /** Party size selected → auto-advance to the calendar. Selections are never deselected. */
  choosePartySize(size: number): void {
    if (this.step() !== 'party-size') return;
    // Only a *different* guest count is a new booking intent: re-confirming the
    // same size must keep the slot (and the typed details) alive, or the round
    // trip back to this step would silently discard both.
    if (size !== this.partySize()) {
      this.selectedSlot.set(null);
      this.clearDetails();
    }
    this.partySize.set(size);
    this.enter('date');
  }

  /** Date selected → auto-advance to the time-slot step. */
  chooseDate(iso: string): void {
    if (this.step() !== 'date') return;
    if (iso !== this.selectedDate()) {
      this.selectedSlot.set(null);
      this.clearDetails();
    }
    this.selectedDate.set(iso);
    this.enter('time');
  }

  /** Slot selected → auto-advance to the details step. */
  chooseSlot(time: string): void {
    if (this.step() !== 'time') return;
    // Re-picking the *same* slot is not a new booking intent: the typed details
    // survive the round trip (BACK_PRESERVES); a different slot clears them.
    if (time !== this.selectedSlot()) this.clearDetails();
    this.selectedSlot.set(time);
    this.enter('details');
  }

  /** Details submitted → confirmation. Only valid from details; flow complete. */
  confirm(): void {
    if (this.step() !== 'details') return;
    this.enter('confirmation');
  }

  /**
   * One step back, preserving all selections (BACK_PRESERVES).
   * No-op on landing and confirmation (flow complete).
   */
  back(): void {
    const target = BACK_TARGET[this.step()];
    if (target) this.enter(target);
  }

  /** Clears the whole flow — called when the restaurant is (re)loaded. */
  reset(): void {
    this.step.set('landing');
    this.partySize.set(null);
    this.selectedDate.set(null);
    this.selectedSlot.set(null);
    this.transitionBusy.set(false);
    this.clearDetails();
  }

  /** Raised by the incoming step when its own fetch starts. */
  beginTransition(): void {
    this.transitionBusy.set(true);
  }

  /** Cleared by that step once its fetch resolves or rejects. */
  endTransition(): void {
    this.transitionBusy.set(false);
  }

  /** Details step writes every edit back so the draft always reflects what was typed. */
  saveDetails(draft: DetailsDraft): void {
    this.details.set({ ...draft });
  }

  private clearDetails(): void {
    this.details.set({ ...EMPTY_DETAILS });
  }

  /**
   * Every transition starts clean: work left in flight by a step being left
   * behind must never leave the incoming step reporting `aria-busy`. The
   * incoming step raises the flag again when it has work of its own.
   */
  private enter(step: BookingFlowStep): void {
    this.transitionBusy.set(false);
    this.step.set(step);
  }
}
