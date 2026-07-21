import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AvailabilityPageComponent } from './availability-page.component';
import { OnboardingService } from '../../services/onboarding.service';
import { signal } from '@angular/core';

describe('AvailabilityPageComponent (ATDD)', () => {
  let component: AvailabilityPageComponent;
  let fixture: ComponentFixture<AvailabilityPageComponent>;
  let onboardingServiceSpy: {
    updateRestaurant: ReturnType<typeof vi.fn>;
    getRestaurant: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    onboardingServiceSpy = {
      updateRestaurant: vi.fn().mockResolvedValue(undefined),
      getRestaurant: vi.fn().mockResolvedValue({
        id: 'test-id',
        name: 'Test Restaurant',
        slug: 'test-restaurant',
        ownerId: 'user-1',
        timezone: 'Europe/London',
        hours: {},
        tableGroups: [],
        whiteLabel: { primaryColor: '#000000', secondaryColor: '#FFFFFF' },
        onboardingCompleted: false,
        createdAt: new Date(),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [AvailabilityPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: '**', component: AvailabilityPageComponent }]),
        { provide: OnboardingService, useValue: onboardingServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AvailabilityPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Step Indicator (AC: 1)', () => {
    it('should display step 2 of 3', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const stepIndicator = fixture.nativeElement.querySelector('[data-testid="step-indicator"]');
      expect(stepIndicator?.textContent).toContain('Step 2 of 3: Availability');
    }));

    it('should display heading', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const heading = fixture.nativeElement.querySelector('h1');
      expect(heading?.textContent).toContain('When are you open?');
    }));
  });

  describe('Weekly Schedule (AC: 2)', () => {
    it('should display all seven days', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      for (const day of days) {
        expect(fixture.nativeElement.textContent).toContain(day);
      }
    }));

    it('should have open/closed toggle for each day', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const toggles = fixture.nativeElement.querySelectorAll('[data-testid*="toggle-"]');
      expect(toggles.length).toBe(7);
    }));
  });

  describe('Time Inputs (AC: 3)', () => {
    it('should show time inputs when day is toggled open', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const mondayToggle = fixture.nativeElement.querySelector('[data-testid="toggle-1"]');
      mondayToggle?.click();
      tick();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-testid="open-time-1"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('[data-testid="close-time-1"]')).toBeTruthy();
    }));

    it('should hide time inputs when day is toggled closed', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const mondayToggle = fixture.nativeElement.querySelector('[data-testid="toggle-1"]');
      mondayToggle?.click();
      tick();
      fixture.detectChanges();

      mondayToggle?.click();
      tick();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-testid="open-time-1"]')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('[data-testid="close-time-1"]')).toBeFalsy();
    }));
  });

  describe('Validation Messages (AC: 4, 5)', () => {
    it('should show hours required message when all days closed', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Set your opening hours to continue');
    }));

    it('should show table groups required message when no table groups', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      // Toggle at least one day open
      const mondayToggle = fixture.nativeElement.querySelector('[data-testid="toggle-1"]');
      mondayToggle?.click();
      tick();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Add at least one table group to continue');
    }));
  });

  describe('Continue Button (AC: 6)', () => {
    it('should be disabled when validation fails', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const continueButton = fixture.nativeElement.querySelector('[data-testid="continue-button"]');
      expect(continueButton?.disabled).toBe(true);
    }));

    it('should save data and navigate when valid', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      // Toggle Monday open
      const mondayToggle = fixture.nativeElement.querySelector('[data-testid="toggle-1"]');
      mondayToggle?.click();
      tick();
      fixture.detectChanges();

      // Set times
      const openTime = fixture.nativeElement.querySelector('[data-testid="open-time-1"]');
      const closeTime = fixture.nativeElement.querySelector('[data-testid="close-time-1"]');
      openTime.value = '09:00';
      openTime.dispatchEvent(new Event('input'));
      closeTime.value = '17:00';
      closeTime.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();

      // Add table group
      const addTableGroupButton = fixture.nativeElement.querySelector('[data-testid="add-table-group"]');
      addTableGroupButton?.click();
      tick();
      fixture.detectChanges();

      // Set table group values
      const capacityInput = fixture.nativeElement.querySelector('[data-testid="capacity-0"]');
      const countInput = fixture.nativeElement.querySelector('[data-testid="count-0"]');
      capacityInput.value = '4';
      capacityInput.dispatchEvent(new Event('input'));
      countInput.value = '2';
      countInput.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();

      // Click Continue
      const continueButton = fixture.nativeElement.querySelector('[data-testid="continue-button"]');
      continueButton?.click();
      tick();
      fixture.detectChanges();

      expect(onboardingServiceSpy.updateRestaurant).toHaveBeenCalledWith('test-id', {
        hours: { 1: { open: '09:00', close: '17:00' } },
        tableGroups: [{ capacity: 4, count: 2 }],
      });
    }));
  });
});
