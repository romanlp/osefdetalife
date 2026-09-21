import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsStepComponent } from './details-step.component';
import { BookingService } from '../../services/booking.service';
import type { CustomField } from '../../../shared/types/restaurant';

describe('DetailsStepComponent', () => {
  let fixture: ComponentFixture<DetailsStepComponent>;
  let bookingServiceSpy: { createBooking: ReturnType<typeof vi.fn> };

  function queryEl(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function nameInput(): HTMLInputElement {
    return queryEl().querySelector<HTMLInputElement>('[data-testid="details-name"]')!;
  }

  function emailInput(): HTMLInputElement {
    return queryEl().querySelector<HTMLInputElement>('[data-testid="details-email"]')!;
  }

  function customInput(): HTMLInputElement | null {
    return queryEl().querySelector<HTMLInputElement>('[data-testid="details-custom"]');
  }

  function setInputValue(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  async function createComponent(
    overrides: {
      customField?: CustomField | undefined;
      createBooking?: (input: unknown) => Promise<string>;
      date?: string;
    } = {},
  ): Promise<void> {
    bookingServiceSpy = {
      createBooking: vi.fn().mockImplementation(overrides.createBooking ?? (async () => 'booking-1')),
    };

    await TestBed.configureTestingModule({
      imports: [DetailsStepComponent],
      providers: [{ provide: BookingService, useValue: bookingServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsStepComponent);
    fixture.componentRef.setInput('restaurantId', 'rest-123');
    fixture.componentRef.setInput('date', overrides.date ?? '2026-08-21');
    fixture.componentRef.setInput('time', '19:00');
    fixture.componentRef.setInput('partySize', 4);
    fixture.componentRef.setInput('customField', overrides.customField);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function submitForm(): Promise<void> {
    queryEl().querySelector<HTMLButtonElement>('[data-testid="details-submit"]')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }


  describe('HAPPY_PATH_SUBMIT', () => {
    it('[P0] should trim inputs, write without a custom value, and emit submitted', async () => {
      await createComponent();
      let submittedCount = 0;
      fixture.componentInstance.submitted.subscribe(() => submittedCount++);

      setInputValue(nameInput(), '  Jane Doe  ');
      setInputValue(emailInput(), '  jane@example.com  ');
      await submitForm();

      expect(bookingServiceSpy.createBooking).toHaveBeenCalledTimes(1);
      expect(bookingServiceSpy.createBooking).toHaveBeenCalledWith({
        restaurantId: 'rest-123',
        date: '2026-08-21',
        time: '19:00',
        partySize: 4,
        name: 'Jane Doe',
        email: 'jane@example.com',
      });
      expect(submittedCount).toBe(1);
      expect(queryEl().querySelector('[data-testid="details-error"]')).toBeFalsy();
    });

    it('[P1] should focus the heading on mount and label submit "Confirm Booking"', async () => {
      await createComponent();

      expect(document.activeElement).toBe(queryEl().querySelector('h2'));
      expect(queryEl().querySelector('[data-testid="details-submit"]')?.textContent).toContain(
        'Confirm Booking',
      );
    });
  });

  describe('CUSTOM_REQUIRED', () => {
    it('[P0] should block submit until the labeled field is non-empty', async () => {
      await createComponent({
        customField: { label: 'Allergies', required: true, enabled: true },
      });

      expect(customInput()).toBeTruthy();
      expect(queryEl().querySelector('label[for="details-custom-input"]')?.textContent).toContain(
        'Allergies',
      );

      setInputValue(nameInput(), 'Jane Doe');
      setInputValue(emailInput(), 'jane@example.com');
      setInputValue(customInput()!, '   ');
      await submitForm();

      expect(queryEl().querySelector('#details-custom-error')?.textContent).toContain(
        'This field is required.',
      );
      expect(bookingServiceSpy.createBooking).not.toHaveBeenCalled();

      setInputValue(customInput()!, '  Peanuts  ');
      await submitForm();

      expect(bookingServiceSpy.createBooking).toHaveBeenCalledWith(
        expect.objectContaining({ customFieldValue: 'Peanuts' }),
      );
    });
  });

  describe('CUSTOM_OPTIONAL', () => {
    it('[P0] should submit without a custom value when left empty', async () => {
      await createComponent({
        customField: { label: 'Occasion', required: false, enabled: true },
      });

      expect(customInput()).toBeTruthy();

      setInputValue(nameInput(), 'Jane Doe');
      setInputValue(emailInput(), 'jane@example.com');
      await submitForm();

      expect(bookingServiceSpy.createBooking).toHaveBeenCalledWith({
        restaurantId: 'rest-123',
        date: '2026-08-21',
        time: '19:00',
        partySize: 4,
        name: 'Jane Doe',
        email: 'jane@example.com',
      });
    });
  });

  describe('CUSTOM_HIDDEN', () => {
    it('[P0] should omit the custom value when the field is disabled', async () => {
      await createComponent({
        customField: { label: 'Allergies', required: true, enabled: false },
      });

      expect(customInput()).toBeFalsy();

      setInputValue(nameInput(), 'Jane Doe');
      setInputValue(emailInput(), 'jane@example.com');
      await submitForm();

      expect(bookingServiceSpy.createBooking).toHaveBeenCalledTimes(1);
      const payload = bookingServiceSpy.createBooking.mock.calls[0][0] as Record<string, unknown>;
      expect(payload).not.toHaveProperty('customFieldValue');
    });

    it('[P1] should render no custom input when the restaurant defines none', async () => {
      await createComponent({ customField: undefined });

      expect(customInput()).toBeFalsy();
    });
  });

  describe('VALIDATION_EMPTY', () => {
    it('[P0] should show inline errors with aria-describedby and no write', async () => {
      await createComponent();

      await submitForm();

      expect(queryEl().querySelector('#details-name-error')).toBeTruthy();
      expect(queryEl().querySelector('#details-email-error')).toBeTruthy();
      expect(nameInput().getAttribute('aria-describedby')).toBe('details-name-error');
      expect(emailInput().getAttribute('aria-describedby')).toBe('details-email-error');
      expect(bookingServiceSpy.createBooking).not.toHaveBeenCalled();
    });

    it('[P1] should show no errors before the first submit', async () => {
      await createComponent();

      setInputValue(nameInput(), '');
      setInputValue(emailInput(), 'not-an-email');

      expect(queryEl().querySelector('#details-name-error')).toBeFalsy();
      expect(queryEl().querySelector('#details-email-error')).toBeFalsy();
    });
  });

  describe('VALIDATION_EMAIL', () => {
    it('[P0] should show the format error and no write for a malformed email', async () => {
      await createComponent();

      setInputValue(nameInput(), 'Jane Doe');
      setInputValue(emailInput(), 'jane-at-example');
      await submitForm();

      expect(queryEl().querySelector('#details-email-error')?.textContent).toContain(
        'Please enter a valid email address.',
      );
      expect(bookingServiceSpy.createBooking).not.toHaveBeenCalled();
    });
  });

  describe('SUBMIT_FAILURE', () => {
    it('[P0] should show retryable error, preserve values, and resubmit on retry', async () => {
      let calls = 0;
      await createComponent({
        createBooking: async () => {
          calls++;
          if (calls === 1) throw new Error('unavailable');
          return 'booking-1';
        },
      });
      let submittedCount = 0;
      fixture.componentInstance.submitted.subscribe(() => submittedCount++);

      setInputValue(nameInput(), 'Jane Doe');
      setInputValue(emailInput(), 'jane@example.com');
      await submitForm();

      expect(submittedCount).toBe(0);
      expect(queryEl().querySelector('[data-testid="details-error"]')?.textContent).toContain(
        'Something went wrong. Please try again.',
      );
      expect(nameInput().value).toBe('Jane Doe');
      expect(emailInput().value).toBe('jane@example.com');

      queryEl().querySelector<HTMLButtonElement>('[data-testid="details-retry"]')!.click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(bookingServiceSpy.createBooking).toHaveBeenCalledTimes(2);
      expect(submittedCount).toBe(1);
      expect(queryEl().querySelector('[data-testid="details-error"]')).toBeFalsy();
    });

    it('[P0] should never attempt a write when flow selections are missing', async () => {
      await createComponent({ date: '' });

      setInputValue(nameInput(), 'Jane Doe');
      setInputValue(emailInput(), 'jane@example.com');
      await submitForm();

      expect(bookingServiceSpy.createBooking).not.toHaveBeenCalled();
    });
  });

  describe('DOUBLE_SUBMIT', () => {
    it('[P0] should ignore the second submit while pending', async () => {
      let release!: (value: string) => void;
      await createComponent({
        createBooking: () =>
          new Promise<string>((resolve) => {
            release = resolve;
          }),
      });

      setInputValue(nameInput(), 'Jane Doe');
      setInputValue(emailInput(), 'jane@example.com');

      const submitBtn = (): HTMLButtonElement =>
        queryEl().querySelector<HTMLButtonElement>('[data-testid="details-submit"]')!;
      submitBtn().click();
      fixture.detectChanges();
      expect(submitBtn().disabled).toBe(true);

      submitBtn().click();
      fixture.detectChanges();

      release('booking-1');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(bookingServiceSpy.createBooking).toHaveBeenCalledTimes(1);
      expect(submitBtn().disabled).toBe(false);
    });
  });

  describe('BACK_NAVIGATION', () => {
    it('[P1] should emit back when the back button is tapped', async () => {
      await createComponent();

      let backCount = 0;
      fixture.componentInstance.back.subscribe(() => backCount++);

      queryEl().querySelector<HTMLButtonElement>('[data-testid="details-back"]')!.click();
      fixture.detectChanges();

      expect(backCount).toBe(1);
    });
  });
});

