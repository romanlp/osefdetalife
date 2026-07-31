import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BrandingPageComponent } from './branding-page.component';
import { OnboardingService } from '../../services/onboarding.service';
import type { Restaurant } from '../../../shared/types/restaurant';

const RESTAURANT_FIXTURE: Restaurant = {
  id: 'test-id',
  name: 'Test Restaurant',
  slug: 'test-restaurant',
  ownerId: 'user-1',
  timezone: 'Europe/London',
  hours: {},
  tableGroups: [],
  whiteLabel: { primaryColor: '#C0392B', secondaryColor: '#27AE60' },
  onboardingCompleted: false,
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

const BRANDED_RESTAURANT_FIXTURE: Restaurant = {
  ...RESTAURANT_FIXTURE,
  whiteLabel: { primaryColor: '#1A1A1A', secondaryColor: '#8FA67A' },
  customField: { label: 'Dietary notes', required: true, enabled: true },
};

describe('BrandingPageComponent', () => {
  let component: BrandingPageComponent;
  let fixture: ComponentFixture<BrandingPageComponent>;
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
      getRestaurant: vi.fn().mockResolvedValue(RESTAURANT_FIXTURE),
      getCurrentUser: vi.fn().mockReturnValue({ uid: 'user-1' }),
      getRestaurantByOwner: vi.fn().mockResolvedValue(RESTAURANT_FIXTURE),
    };

    await TestBed.configureTestingModule({
      imports: [BrandingPageComponent],
      providers: [
        provideRouter([{ path: 'dashboard', component: BrandingPageComponent }]),
        { provide: OnboardingService, useValue: onboardingServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(BrandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Step Indicator (AC: 1)', () => {
    it.skip('[P0] should display step 3 of 3 caption', () => {
      const stepIndicator = fixture.nativeElement.querySelector('p');
      expect(stepIndicator?.textContent).toContain('Step 3 of 3: Branding');
    });

    it.skip('[P0] should display the "Style your booking widget" heading', () => {
      const heading = fixture.nativeElement.querySelector('h1');
      expect(heading?.textContent).toContain('Style your booking widget');
    });

    it.skip('[P1] should show a visible Skip link', () => {
      const skipLink = fixture.nativeElement.querySelector('[data-testid="skip-link"]');
      expect(skipLink).toBeTruthy();
      expect(skipLink?.textContent).toContain('Skip');
    });
  });

  describe('Color Pickers (AC: 2)', () => {
    it.skip('[P0] should show primary and secondary color pickers', () => {
      expect(fixture.nativeElement.querySelector('[data-testid="color-primary"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('[data-testid="color-secondary"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('[data-testid="hex-primary"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('[data-testid="hex-secondary"]')).toBeTruthy();
    });

    it.skip('[P0] should pre-fill colors from restaurant.whiteLabel', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.primaryColor()).toBe('#C0392B');
      expect(component.secondaryColor()).toBe('#27AE60');
      expect(fixture.nativeElement.querySelector('[data-testid="hex-primary"]')?.value).toBe('#C0392B');
      expect(fixture.nativeElement.querySelector('[data-testid="hex-secondary"]')?.value).toBe('#27AE60');
    });

    it.skip('[P1] should fall back to DESIGN palette when whiteLabel is missing', async () => {
      onboardingServiceSpy.getRestaurantByOwner.mockResolvedValue({
        ...RESTAURANT_FIXTURE,
        whiteLabel: undefined,
      } as unknown as Restaurant);

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.primaryColor()).toBe('#1A1A1A');
      expect(component.secondaryColor()).toBe('#8FA67A');
      expect(fixture.nativeElement.querySelector('[data-testid="hex-primary"]')?.value).toBe('#1A1A1A');
      expect(fixture.nativeElement.querySelector('[data-testid="hex-secondary"]')?.value).toBe('#8FA67A');
    });

    it.skip('[P1] should keep the hex text input and color swatch in sync', () => {
      const hexInput = fixture.nativeElement.querySelector('[data-testid="hex-primary"]');
      hexInput.value = '#00ff88';
      hexInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.primaryColor()).toBe('#00ff88');
      expect(fixture.nativeElement.querySelector('[data-testid="color-primary"]')?.value).toBe('#00ff88');
    });

    it.skip('[P2] should expose aria-labels on the native color inputs', () => {
      expect(fixture.nativeElement.querySelector('[data-testid="color-primary"]')?.getAttribute('aria-label')).toBe('Primary color');
      expect(fixture.nativeElement.querySelector('[data-testid="color-secondary"]')?.getAttribute('aria-label')).toBe('Secondary color');
    });
  });

  describe('Hex Validation (AC: 2)', () => {
    it.skip('[P0] should show an error message for an invalid hex color', () => {
      component.primaryColor.set('red');
      fixture.detectChanges();

      const alert = fixture.nativeElement.querySelector('[role="alert"]');
      expect(alert).toBeTruthy();
      expect(alert?.textContent.toLowerCase()).toContain('hex');
    });

    it.skip('[P0] should disable Complete while hex colors are invalid', () => {
      component.primaryColor.set('12345');
      fixture.detectChanges();

      const completeButton = fixture.nativeElement.querySelector('[data-testid="complete-button"]');
      expect(completeButton?.disabled).toBe(true);
    });

    it.skip('[P1] should accept valid hex colors case-insensitively', () => {
      component.primaryColor.set('#aAbBcC');
      component.secondaryColor.set('#AaBbCc');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('[data-testid="complete-button"]')?.disabled).toBe(false);
    });

    it.skip('[P2] should announce validation errors via role="alert"', () => {
      component.primaryColor.set('not-a-color');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    });
  });

  describe('Custom Field (AC: 3)', () => {
    it.skip('[P0] should render label, required, and enabled controls', () => {
      expect(fixture.nativeElement.querySelector('[data-testid="custom-field-label"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('[data-testid="custom-field-required"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('[data-testid="custom-field-enabled"]')).toBeTruthy();
    });

    it.skip('[P0] should default the custom field to disabled', () => {
      expect(component.customFieldLabel()).toBe('');
      expect(component.customFieldRequired()).toBe(false);
      expect(component.customFieldEnabled()).toBe(false);
    });

    it.skip('[P1] should pre-fill the custom field from restaurant.customField', async () => {
      onboardingServiceSpy.getRestaurantByOwner.mockResolvedValue(BRANDED_RESTAURANT_FIXTURE);

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.customFieldLabel()).toBe('Dietary notes');
      expect(component.customFieldRequired()).toBe(true);
      expect(component.customFieldEnabled()).toBe(true);
      expect(fixture.nativeElement.querySelector('[data-testid="custom-field-label"]')?.value).toBe('Dietary notes');
    });

    it.skip('[P1] should update customFieldLabel when the label input changes', () => {
      const labelInput = fixture.nativeElement.querySelector('[data-testid="custom-field-label"]');
      labelInput.value = 'Allergies';
      labelInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.customFieldLabel()).toBe('Allergies');
    });

    it.skip('[P2] should update customFieldRequired from the required toggle', () => {
      component.customFieldRequired.set(true);
      fixture.detectChanges();

      expect(component.customFieldRequired()).toBe(true);
      expect(component.customFieldEnabled()).toBe(false);
    });
  });

  describe('Skip (AC: 4)', () => {
    it.skip('[P0] should save only { onboardingCompleted: true } on Skip', async () => {
      vi.spyOn(router, 'navigate').mockResolvedValue(true);

      component.primaryColor.set('#FF0000');
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="skip-link"]')?.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(onboardingServiceSpy.updateRestaurant).toHaveBeenCalledTimes(1);
      expect(onboardingServiceSpy.updateRestaurant).toHaveBeenCalledWith('test-id', {
        onboardingCompleted: true,
      });
    });

    it.skip('[P0] should not save whiteLabel or customField on Skip', async () => {
      vi.spyOn(router, 'navigate').mockResolvedValue(true);

      fixture.nativeElement.querySelector('[data-testid="skip-link"]')?.click();
      await fixture.whenStable();
      fixture.detectChanges();

      const payload = onboardingServiceSpy.updateRestaurant.mock.calls[0]?.[1];
      expect(payload).not.toHaveProperty('whiteLabel');
      expect(payload).not.toHaveProperty('customField');
    });

    it.skip('[P1] should navigate to /dashboard on Skip', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      fixture.nativeElement.querySelector('[data-testid="skip-link"]')?.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('Complete (AC: 5)', () => {
    it.skip('[P0] should save whiteLabel, customField, and onboardingCompleted: true', async () => {
      vi.spyOn(router, 'navigate').mockResolvedValue(true);

      component.primaryColor.set('#336699');
      component.secondaryColor.set('#AABBCC');
      component.customFieldLabel.set('Dietary notes');
      component.customFieldRequired.set(true);
      component.customFieldEnabled.set(true);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="complete-button"]')?.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(onboardingServiceSpy.updateRestaurant).toHaveBeenCalledWith('test-id', {
        whiteLabel: { primaryColor: '#336699', secondaryColor: '#AABBCC' },
        customField: { label: 'Dietary notes', required: true, enabled: true },
        onboardingCompleted: true,
      });
    });

    it.skip('[P0] should persist customField even when the custom field is disabled', async () => {
      vi.spyOn(router, 'navigate').mockResolvedValue(true);

      fixture.nativeElement.querySelector('[data-testid="complete-button"]')?.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(onboardingServiceSpy.updateRestaurant).toHaveBeenCalledWith('test-id', {
        whiteLabel: { primaryColor: '#C0392B', secondaryColor: '#27AE60' },
        customField: { label: '', required: false, enabled: false },
        onboardingCompleted: true,
      });
    });

    it.skip('[P1] should navigate to /dashboard on Complete', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      fixture.nativeElement.querySelector('[data-testid="complete-button"]')?.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it.skip('[P1] should disable Complete with aria-busy while saving', async () => {
      vi.spyOn(router, 'navigate').mockResolvedValue(true);

      const completeButton = fixture.nativeElement.querySelector('[data-testid="complete-button"]');
      completeButton?.click();
      fixture.detectChanges();

      expect(completeButton?.getAttribute('aria-busy')).toBe('true');
      expect(completeButton?.disabled).toBe(true);

      await fixture.whenStable();
      fixture.detectChanges();
    });

    it.skip('[P1] should show the save error and not navigate when the update fails', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      onboardingServiceSpy.updateRestaurant.mockRejectedValueOnce(new Error('Save failed'));

      fixture.nativeElement.querySelector('[data-testid="complete-button"]')?.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Save failed');
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it.skip('[P1] should enable Complete when colors are valid', () => {
      const completeButton = fixture.nativeElement.querySelector('[data-testid="complete-button"]');
      expect(completeButton?.disabled).toBe(false);
    });
  });
});
