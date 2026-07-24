import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AvailabilityPageComponent } from './availability-page.component';
import { OnboardingService } from '../../services/onboarding.service';

describe('AvailabilityPageComponent', () => {
  let component: AvailabilityPageComponent;
  let fixture: ComponentFixture<AvailabilityPageComponent>;
  let router: Router;
  let onboardingServiceSpy: {
    updateRestaurant: ReturnType<typeof vi.fn>;
    getRestaurant: ReturnType<typeof vi.fn>;
    getCurrentUser: ReturnType<typeof vi.fn>;
    getRestaurantByOwner: ReturnType<typeof vi.fn>;
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
      getCurrentUser: vi.fn().mockReturnValue({ uid: 'user-1' }),
      getRestaurantByOwner: vi.fn().mockResolvedValue({
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
      imports: [AvailabilityPageComponent],
      providers: [
        provideRouter([
          { path: 'onboarding/branding', component: AvailabilityPageComponent },
        ]),
        { provide: OnboardingService, useValue: onboardingServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AvailabilityPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Step Indicator (AC: 1)', () => {
    it('should display step 2 of 3', () => {
      const stepIndicator = fixture.nativeElement.querySelector('p');
      expect(stepIndicator?.textContent).toContain('Step 2 of 3: Availability');
    });

    it('should display heading', () => {
      const heading = fixture.nativeElement.querySelector('h1');
      expect(heading?.textContent).toContain('When are you open?');
    });
  });

  describe('Weekly Schedule (AC: 2)', () => {
    it('should display all seven days', () => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      for (const day of days) {
        expect(fixture.nativeElement.textContent).toContain(day);
      }
    });

    it('should have open/closed toggle for each day', () => {
      const toggles = fixture.nativeElement.querySelectorAll('[data-testid*="toggle-"]');
      expect(toggles.length).toBe(7);
    });
  });

  describe('Time Inputs (AC: 3)', () => {
    it('should show time inputs when day is toggled open', () => {
      component.toggleDay(component.days[0]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-testid="open-time-1"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('[data-testid="close-time-1"]')).toBeTruthy();
    });

    it('should hide time inputs when day is toggled closed', () => {
      component.toggleDay(component.days[0]);
      fixture.detectChanges();

      component.toggleDay(component.days[0]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-testid="open-time-1"]')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('[data-testid="close-time-1"]')).toBeFalsy();
    });
  });

  describe('Validation Messages (AC: 4, 5)', () => {
    it('should show hours required message when all days closed', () => {
      expect(fixture.nativeElement.textContent).toContain('Set your opening hours to continue');
    });

    it('should show table groups required message when no table groups', () => {
      component.toggleDay(component.days[0]);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Add at least one table group to continue');
    });
  });

  describe('Continue Button (AC: 6)', () => {
    it('should be disabled when validation fails', () => {
      const continueButton = fixture.nativeElement.querySelector('[data-testid="continue-button"]');
      expect(continueButton?.disabled).toBe(true);
    });

    it('should save data and navigate when valid', async () => {
      vi.spyOn(router, 'navigate').mockResolvedValue(true);

      component.toggleDay(component.days[0]);
      component.addTableGroup();
      fixture.detectChanges();

      const continueButton = fixture.nativeElement.querySelector('[data-testid="continue-button"]');
      expect(continueButton?.disabled).toBe(false);

      continueButton?.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(onboardingServiceSpy.updateRestaurant).toHaveBeenCalledWith('test-id', {
        hours: { 1: { open: '09:00', close: '17:00' } },
        tableGroups: [{ capacity: 2, count: 1 }],
      });
    });
  });
});
