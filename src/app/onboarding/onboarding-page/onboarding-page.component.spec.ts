import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { OnboardingPageComponent } from './onboarding-page.component';
import { OnboardingService } from '../../services/onboarding.service';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: { uid: 'user-123' } })),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  collection: vi.fn(),
  setDoc: vi.fn(() => Promise.resolve()),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
  updateDoc: vi.fn(() => Promise.resolve()),
  serverTimestamp: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
}));

describe('OnboardingPageComponent', () => {
  let component: OnboardingPageComponent;
  let fixture: ComponentFixture<OnboardingPageComponent>;
  let onboardingService: OnboardingService;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [OnboardingPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingPageComponent);
    component = fixture.componentInstance;
    onboardingService = TestBed.inject(OnboardingService);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function advanceDebounce(): Promise<void> {
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('slug generation', () => {
    it('should auto-generate slug from restaurant name', async () => {
      component.onboardingForm.name().value.set('The Blue Bistro');
      await vi.advanceTimersByTimeAsync(300);
      expect(component.formData().slug).toBe('the-blue-bistro');
    });

    it('should update slug when name changes', async () => {
      component.onboardingForm.name().value.set('Joe');
      await vi.advanceTimersByTimeAsync(300);
      expect(component.formData().slug).toBe('joe');
      component.onboardingForm.name().value.set('Joe\'s Pizza');
      await vi.advanceTimersByTimeAsync(300);
      expect(component.formData().slug).toBe('joes-pizza');
    });
  });

  describe('slug validation', () => {
    it('should check slug availability after debounce', async () => {
      const spy = vi.spyOn(onboardingService, 'checkSlugAvailability').mockResolvedValue(true);

      component.onboardingForm.slug().value.set('my-restaurant');
      await advanceDebounce();

      expect(spy).toHaveBeenCalledWith('my-restaurant');
      expect(component.slugAvailable()).toBe(true);
    });

    it('should not check slug availability before debounce completes', () => {
      vi.spyOn(onboardingService, 'checkSlugAvailability').mockResolvedValue(true);

      component.onboardingForm.slug().value.set('my-restaurant');
      expect(onboardingService.checkSlugAvailability).not.toHaveBeenCalled();
      expect(component.slugAvailable()).toBeNull();
    });

    it('should show taken slug message when unavailable', async () => {
      vi.spyOn(onboardingService, 'checkSlugAvailability').mockResolvedValue(false);

      component.onboardingForm.slug().value.set('taken-slug');
      await advanceDebounce();

      expect(component.slugAvailable()).toBe(false);
    });

    it('should show error message when slug check fails', async () => {
      vi.spyOn(onboardingService, 'checkSlugAvailability').mockRejectedValue(new Error('Firestore error'));

      component.onboardingForm.slug().value.set('my-restaurant');
      await advanceDebounce();

      expect(component.slugAvailable()).toBeNull();
      expect(component.slugError()).toBe('Unable to check slug availability. Please try again.');
    });

    it('should clear slug error when slug input changes', async () => {
      vi.spyOn(onboardingService, 'checkSlugAvailability').mockRejectedValue(new Error('Firestore error'));

      component.onboardingForm.slug().value.set('my-restaurant');
      await advanceDebounce();

      expect(component.slugError()).toBe('Unable to check slug availability. Please try again.');

      vi.spyOn(onboardingService, 'checkSlugAvailability').mockResolvedValue(true);
      component.onboardingForm.slug().value.set('new-restaurant');
      await advanceDebounce();

      expect(component.slugError()).toBeNull();
    });

    it('should clear availability when slug is empty', async () => {
      component.onboardingForm.slug().value.set('');
      await advanceDebounce();

      expect(component.slugAvailable()).toBeNull();
      expect(component.slugChecking()).toBe(false);
    });
  });

  describe('form validation', () => {
    it('should disable continue button when name is empty', () => {
      component.onboardingForm.name().value.set('');
      component.onboardingForm.slug().value.set('');
      expect(component.canContinue()).toBe(false);
    });

    it('should disable continue button when slug is not available', async () => {
      vi.spyOn(onboardingService, 'checkSlugAvailability').mockResolvedValue(false);
      component.onboardingForm.name().value.set('Test');
      component.onboardingForm.slug().value.set('test');
      await advanceDebounce();
      expect(component.canContinue()).toBe(false);
    });

    it('should enable continue button when name and slug are valid', async () => {
      vi.spyOn(onboardingService, 'checkSlugAvailability').mockResolvedValue(true);
      component.onboardingForm.name().value.set('Test');
      component.onboardingForm.slug().value.set('test');
      await advanceDebounce();
      expect(component.canContinue()).toBe(true);
    });
  });

  describe('form submission', () => {
    it('should call createRestaurant and navigate on success', async () => {
      const createSpy = vi.spyOn(onboardingService, 'createRestaurant').mockResolvedValue('new-id');
      const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate' as never);
      vi.spyOn(onboardingService, 'checkSlugAvailability').mockResolvedValue(true);

      component.onboardingForm.name().value.set('Blue Bistro');
      component.onboardingForm.slug().value.set('blue-bistro');
      await advanceDebounce();

      await component.continueToStep2();

      expect(createSpy).toHaveBeenCalledWith('Blue Bistro', 'blue-bistro', undefined);
      expect(navigateSpy).toHaveBeenCalledWith(['/onboarding/availability']);
    });

    it('should include address when provided', async () => {
      const createSpy = vi.spyOn(onboardingService, 'createRestaurant').mockResolvedValue('new-id');
      vi.spyOn(TestBed.inject(Router), 'navigate' as never);
      vi.spyOn(onboardingService, 'checkSlugAvailability').mockResolvedValue(true);

      component.onboardingForm.name().value.set('Blue Bistro');
      component.onboardingForm.slug().value.set('blue-bistro');
      component.onboardingForm.address().value.set('123 Main St');
      await advanceDebounce();

      await component.continueToStep2();

      expect(createSpy).toHaveBeenCalledWith('Blue Bistro', 'blue-bistro', '123 Main St');
    });

    it('should set error on failure', async () => {
      vi.spyOn(onboardingService, 'createRestaurant').mockRejectedValue(new Error('Firestore error'));
      vi.spyOn(onboardingService, 'checkSlugAvailability').mockResolvedValue(true);

      component.onboardingForm.name().value.set('Blue Bistro');
      component.onboardingForm.slug().value.set('blue-bistro');
      await advanceDebounce();

      await component.continueToStep2();

      expect(component.error()).toBe('Firestore error');
    });
  });

  describe('template', () => {
    it('should render step indicator', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Step 1 of 3');
    });

    it('should render heading', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Tell us about your restaurant');
    });

    it('should render Continue button', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('button[type="submit"]')?.textContent?.trim()).toBe('Continue');
    });

    it('should show slug preview when slug is set', async () => {
      component.onboardingForm.name().value.set('Test Restaurant');
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('bookable.co/test-restaurant');
    });
  });
});
