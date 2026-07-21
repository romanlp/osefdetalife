import { describe, it, expect, vi, beforeEach } from 'vitest';
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('slug generation', () => {
    it('should auto-generate slug from restaurant name', async () => {
      component.name.set('The Blue Bistro');
      vi.advanceTimersByTime(300);
      await fixture.whenStable();
      expect(component.slug()).toBe('the-blue-bistro');
    });

    it('should update slug when name changes', async () => {
      component.name.set('Joe');
      vi.advanceTimersByTime(300);
      await fixture.whenStable();
      expect(component.slug()).toBe('joe');
      component.name.set('Joe\'s Pizza');
      vi.advanceTimersByTime(300);
      await fixture.whenStable();
      expect(component.slug()).toBe('joes-pizza');
    });
  });

  describe('slug validation', () => {
    it('should check slug availability after debounce', async () => {
      const spy = vi.spyOn(onboardingService, 'checkSlugAvailability').mockResolvedValue(true);

      component.onSlugInput('my-restaurant');

      expect(component.slugChecking()).toBe(true);

      vi.advanceTimersByTime(300);
      await fixture.whenStable();

      expect(spy).toHaveBeenCalledWith('my-restaurant');
      expect(component.slugAvailable()).toBe(true);
    });

    it('should show taken slug message when unavailable', async () => {
      vi.spyOn(onboardingService, 'checkSlugAvailability').mockResolvedValue(false);

      component.onSlugInput('taken-slug');
      vi.advanceTimersByTime(300);
      await fixture.whenStable();

      expect(component.slugAvailable()).toBe(false);
    });

    it('should clear availability when slug is empty', () => {
      component.onSlugInput('');
      expect(component.slugAvailable()).toBeNull();
      expect(component.slugChecking()).toBe(false);
    });
  });

  describe('form validation', () => {
    it('should disable continue button when name is empty', () => {
      component.name.set('');
      component.slug.set('');
      expect(component.canContinue()).toBe(false);
    });

    it('should disable continue button when slug is not available', () => {
      component.name.set('Test');
      component.slug.set('test');
      component.slugAvailable.set(false);
      expect(component.canContinue()).toBe(false);
    });

    it('should enable continue button when name and slug are valid', () => {
      component.name.set('Test');
      component.slug.set('test');
      component.slugAvailable.set(true);
      expect(component.canContinue()).toBe(true);
    });
  });

  describe('form submission', () => {
    it('should call createRestaurant and navigate on success', async () => {
      const createSpy = vi.spyOn(onboardingService, 'createRestaurant').mockResolvedValue('new-id');
      const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate' as never);

      component.name.set('Blue Bistro');
      component.slug.set('blue-bistro');
      component.slugAvailable.set(true);

      await component.continueToStep2();

      expect(createSpy).toHaveBeenCalledWith('Blue Bistro', 'blue-bistro', undefined);
      expect(navigateSpy).toHaveBeenCalledWith(['/onboarding/availability']);
    });

    it('should include address when provided', async () => {
      const createSpy = vi.spyOn(onboardingService, 'createRestaurant').mockResolvedValue('new-id');
      vi.spyOn(TestBed.inject(Router), 'navigate' as never);

      component.name.set('Blue Bistro');
      component.slug.set('blue-bistro');
      component.slugAvailable.set(true);
      component.address.set('123 Main St');

      await component.continueToStep2();

      expect(createSpy).toHaveBeenCalledWith('Blue Bistro', 'blue-bistro', '123 Main St');
    });

    it('should set error on failure', async () => {
      vi.spyOn(onboardingService, 'createRestaurant').mockRejectedValue(new Error('Firestore error'));

      component.name.set('Blue Bistro');
      component.slug.set('blue-bistro');
      component.slugAvailable.set(true);

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
      component.name.set('Test Restaurant');
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('bookable.co/test-restaurant');
    });
  });
});
