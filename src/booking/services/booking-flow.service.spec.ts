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
    it('[P0] should walk landing → party-size → date → time via the actions', () => {
      expect(service.step()).toBe('landing');

      service.start();
      expect(service.step()).toBe('party-size');

      service.choosePartySize(4);
      expect(service.partySize()).toBe(4);
      expect(service.step()).toBe('date');

      service.chooseDate('2026-08-21');
      expect(service.selectedDate()).toBe('2026-08-21');
      expect(service.step()).toBe('time');
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

      service.reset();

      expect(service.step()).toBe('landing');
      expect(service.partySize()).toBeNull();
      expect(service.selectedDate()).toBeNull();
    });
  });
});
