import { describe, beforeEach, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BookingFlowService } from './booking-flow.service';

describe('BookingFlowService', () => {
  let service: BookingFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingFlowService);
  });

  describe('HAPPY_PATH', () => {
    it('[P0] should walk landing → party-size → date → time → details via the actions', () => {
      expect(service.step()).toBe('landing');

      service.start();
      expect(service.step()).toBe('party-size');

      service.choosePartySize(4);
      expect(service.partySize()).toBe(4);
      expect(service.step()).toBe('date');

      service.chooseDate('2026-08-21');
      expect(service.selectedDate()).toBe('2026-08-21');
      expect(service.step()).toBe('time');

      service.chooseSlot('19:00');
      expect(service.selectedSlot()).toBe('19:00');
      expect(service.step()).toBe('details');
    });
  });

  describe('BACK_PRESERVES', () => {
    it('[P0] should return from date to party-size keeping the chosen size', () => {
      service.start();
      service.choosePartySize(4);
      service.back();

      expect(service.step()).toBe('party-size');
      expect(service.partySize()).toBe(4);
    });

    it('[P0] should return from time to date keeping the chosen date', () => {
      service.start();
      service.choosePartySize(4);
      service.chooseDate('2026-08-21');
      service.back();

      expect(service.step()).toBe('date');
      expect(service.selectedDate()).toBe('2026-08-21');
    });

    it('[P1] should return from party-size to landing', () => {
      service.start();
      service.back();

      expect(service.step()).toBe('landing');
    });

    it('[P0] should return from details to time keeping slot, date, and party intact', () => {
      service.start();
      service.choosePartySize(4);
      service.chooseDate('2026-08-21');
      service.chooseSlot('19:00');
      service.back();

      expect(service.step()).toBe('time');
      expect(service.selectedSlot()).toBe('19:00');
      expect(service.selectedDate()).toBe('2026-08-21');
      expect(service.partySize()).toBe(4);
    });

    it('[P1] should record a revised slot when a different one is chosen after back', () => {
      service.start();
      service.choosePartySize(4);
      service.chooseDate('2026-08-21');
      service.chooseSlot('19:00');
      service.back();

      service.chooseSlot('20:30');

      expect(service.selectedSlot()).toBe('20:30');
      expect(service.step()).toBe('details');
    });

    it('[P1] should clear a stale slot when party size or date is revised', () => {
      service.start();
      service.choosePartySize(4);
      service.chooseDate('2026-08-21');
      service.chooseSlot('19:00');
      expect(service.selectedSlot()).toBe('19:00');

      service.back();
      service.back();
      service.chooseDate('2026-08-22');
      expect(service.selectedSlot()).toBeNull();
      expect(service.step()).toBe('time');

      service.chooseSlot('20:30');
      service.back();
      service.back();
      service.back();
      service.choosePartySize(2);
      expect(service.selectedSlot()).toBeNull();
      expect(service.step()).toBe('date');
    });

    it('[P1] should update the size and re-advance to the date step when choosing a different size after back', () => {
      service.start();
      service.choosePartySize(4);
      expect(service.partySize()).toBe(4);

      service.back();
      expect(service.step()).toBe('party-size');

      service.choosePartySize(2);
      expect(service.partySize()).toBe(2);
      expect(service.step()).toBe('date');

      // Pick a date, then revise the guest count via two backs — the chosen
      // date must survive (revising party size never erases selections).
      service.chooseDate('2026-08-21');
      expect(service.selectedDate()).toBe('2026-08-21');
      expect(service.step()).toBe('time');

      service.back();
      service.back();
      expect(service.step()).toBe('party-size');

      service.choosePartySize(6);
      expect(service.partySize()).toBe(6);
      expect(service.step()).toBe('date');
      expect(service.selectedDate()).toBe('2026-08-21');
    });

    it('[P1] should be a no-op on landing', () => {
      service.back();

      expect(service.step()).toBe('landing');
    });
  });

  describe('RESET', () => {
    it('[P0] should clear step and selections back to landing', () => {
      service.start();
      service.choosePartySize(4);
      service.chooseDate('2026-08-21');
      service.chooseSlot('19:00');

      service.reset();

      expect(service.step()).toBe('landing');
      expect(service.partySize()).toBeNull();
      expect(service.selectedDate()).toBeNull();
      expect(service.selectedSlot()).toBeNull();
    });

    it('[P0] should clear the details draft and the transition-busy flag too', () => {
      service.start();
      service.choosePartySize(4);
      service.chooseDate('2026-08-21');
      service.chooseSlot('19:00');
      service.saveDetails({ name: 'Jane Doe', email: 'jane@example.com', custom: 'Peanuts' });
      service.beginTransition();

      service.reset();

      expect(service.detailsDraft()).toEqual({ name: '', email: '', custom: '' });
      expect(service.transitionBusy()).toBe(false);
    });
  });

  describe('DETAILS_DRAFT', () => {
    /** Walks the funnel to the details step so the draft is live state. */
    function reachDetails(): void {
      service.start();
      service.choosePartySize(4);
      service.chooseDate('2026-08-21');
      service.chooseSlot('19:00');
    }

    it('[P0] should remember and expose the draft written by the details step', () => {
      reachDetails();

      service.saveDetails({ name: 'Jane Doe', email: 'jane@example.com', custom: 'Peanuts' });

      expect(service.detailsDraft()).toEqual({
        name: 'Jane Doe',
        email: 'jane@example.com',
        custom: 'Peanuts',
      });
    });

    it('[P0] should keep the draft across a back step (BACK_PRESERVES)', () => {
      reachDetails();
      service.saveDetails({ name: 'Jane Doe', email: 'jane@example.com', custom: '' });

      service.back();
      expect(service.step()).toBe('time');
      expect(service.detailsDraft().name).toBe('Jane Doe');

      // Forward again with the same slot — the same booking intent, so the draft returns.
      service.chooseSlot('19:00');
      expect(service.step()).toBe('details');
      expect(service.detailsDraft().email).toBe('jane@example.com');
    });

    it('[P1] should keep the draft when the same slot is re-chosen after back', () => {
      reachDetails();
      service.saveDetails({ name: 'Jane Doe', email: 'jane@example.com', custom: '' });
      service.back();

      service.chooseSlot('19:00');

      expect(service.selectedSlot()).toBe('19:00');
      expect(service.detailsDraft().name).toBe('Jane Doe');
    });
    it('[P0] should clear the draft when a different slot is chosen after back', () => {
      reachDetails();
      service.saveDetails({ name: 'Jane Doe', email: 'jane@example.com', custom: '' });
      service.back();

      service.chooseSlot('20:30');

      expect(service.selectedSlot()).toBe('20:30');
      expect(service.detailsDraft()).toEqual({ name: '', email: '', custom: '' });
    });

    it('[P0] should clear the draft when the party size is revised', () => {
      reachDetails();
      service.saveDetails({ name: 'Jane Doe', email: 'jane@example.com', custom: '' });
      service.back();
      service.back();
      service.back();
      expect(service.step()).toBe('party-size');

      service.choosePartySize(2);

      expect(service.detailsDraft()).toEqual({ name: '', email: '', custom: '' });
    });

    it('[P0] should keep the draft and the slot when the same party size is re-confirmed', () => {
      reachDetails();
      service.saveDetails({ name: 'Jane Doe', email: 'jane@example.com', custom: '' });
      service.back();
      service.back();
      service.back();
      expect(service.step()).toBe('party-size');

      // Same guest count → same booking intent: nothing is discarded.
      service.choosePartySize(4);

      expect(service.partySize()).toBe(4);
      expect(service.selectedSlot()).toBe('19:00');
      expect(service.detailsDraft()).toEqual({
        name: 'Jane Doe',
        email: 'jane@example.com',
        custom: '',
      });
    });

    it('[P0] should clear the draft when a different date is chosen', () => {
      reachDetails();
      service.saveDetails({ name: 'Jane Doe', email: 'jane@example.com', custom: '' });
      service.back();
      expect(service.step()).toBe('time');
      service.back();
      expect(service.step()).toBe('date');

      service.chooseDate('2026-08-22');

      expect(service.selectedDate()).toBe('2026-08-22');
      expect(service.detailsDraft()).toEqual({ name: '', email: '', custom: '' });
    });
  });

  describe('TRANSITION_BUSY', () => {
    it('[P0] should raise and clear the busy flag through the begin/end pair', () => {
      expect(service.transitionBusy()).toBe(false);

      service.beginTransition();
      expect(service.transitionBusy()).toBe(true);

      service.endTransition();
      expect(service.transitionBusy()).toBe(false);
    });

    it('[P0] should clear a stale busy flag on a transition into a new step', () => {
      service.beginTransition();

      service.start();

      expect(service.step()).toBe('party-size');
      expect(service.transitionBusy()).toBe(false);
    });

    it('[P1] should clear a stale busy flag when a step is left via back', () => {
      service.start();
      service.choosePartySize(4);
      service.chooseDate('2026-08-21');
      service.beginTransition();

      service.back();

      expect(service.step()).toBe('date');
      expect(service.transitionBusy()).toBe(false);
    });
  });

  describe('CONFIRM', () => {
    it('[P0] should advance from details to confirmation', () => {
      service.start();
      service.choosePartySize(4);
      service.chooseDate('2026-08-21');
      service.chooseSlot('19:00');
      service.confirm();

      expect(service.step()).toBe('confirmation');
      expect(service.selectedSlot()).toBe('19:00');
      expect(service.selectedDate()).toBe('2026-08-21');
      expect(service.partySize()).toBe(4);
    });

    it('[P1] should be a no-op outside details and ignore back from confirmation', () => {
      service.confirm();
      expect(service.step()).toBe('landing');

      service.start();
      service.confirm();
      expect(service.step()).toBe('party-size');

      service.choosePartySize(4);
      service.chooseDate('2026-08-21');
      service.chooseSlot('19:00');
      service.confirm();
      service.back();
      expect(service.step()).toBe('confirmation');
    });
  describe('OUT_OF_ORDER', () => {
    it('[P0] should ignore start from any step but landing', () => {
      service.start();
      service.choosePartySize(4);
      expect(service.step()).toBe('date');

      service.start();

      expect(service.step()).toBe('date');
      expect(service.partySize()).toBe(4);
    });

    it('[P0] should ignore choosePartySize outside the party-size step', () => {
      service.start();
      service.choosePartySize(4);
      service.chooseDate('2026-08-21');

      service.choosePartySize(2);

      expect(service.step()).toBe('time');
      expect(service.partySize()).toBe(4);
      expect(service.selectedDate()).toBe('2026-08-21');
    });

    it('[P0] should ignore chooseDate outside the date step', () => {
      service.start();
      service.choosePartySize(4);
      service.chooseDate('2026-08-21');
      expect(service.step()).toBe('time');

      service.chooseDate('2026-08-22');

      expect(service.step()).toBe('time');
      expect(service.selectedDate()).toBe('2026-08-21');
    });

    it('[P0] should ignore chooseSlot outside the time step', () => {
      service.chooseSlot('19:00');

      expect(service.step()).toBe('landing');
      expect(service.selectedSlot()).toBeNull();

      service.start();
      service.choosePartySize(4);
      service.chooseDate('2026-08-21');
      service.chooseSlot('19:00');
      expect(service.step()).toBe('details');

      service.chooseSlot('20:30');

      expect(service.step()).toBe('details');
      expect(service.selectedSlot()).toBe('19:00');
    });

    it('[P0] should ignore a skip straight from landing to the details step', () => {
      service.choosePartySize(4);
      service.chooseDate('2026-08-21');
      service.chooseSlot('19:00');

      expect(service.step()).toBe('landing');
      expect(service.partySize()).toBeNull();
      expect(service.selectedDate()).toBeNull();
      expect(service.selectedSlot()).toBeNull();
    });
  });

  });
});
