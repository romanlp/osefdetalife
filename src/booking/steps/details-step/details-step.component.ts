import {
  AfterViewInit,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { CustomField } from '../../../shared/types/restaurant';
import { BookingService } from '../../services/booking.service';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'osef-details-step',
  imports: [ReactiveFormsModule],
  templateUrl: './details-step.component.html',
  styleUrl: './details-step.component.scss',
})
export class DetailsStepComponent implements AfterViewInit {
  readonly restaurantId = input.required<string>();
  readonly date = input.required<string>();
  readonly time = input.required<string>();
  readonly partySize = input.required<number>();
  /** Restaurant-configured extra field; hidden entirely when disabled/absent. */
  readonly customField = input<CustomField | undefined>(undefined);

  readonly submitted = output<void>();
  readonly back = output<void>();

  private readonly bookingService = inject(BookingService);
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('heading');

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
    custom: new FormControl('', { nonNullable: true }),
  });

  /** Latched on first submit — inline errors never appear on blur/input. */
  private readonly submitAttempted = signal(false);
  readonly pending = signal(false);
  readonly submitError = signal(false);

  /** Shown only when the restaurant enabled its custom field. */
  readonly showCustom = computed(() => this.customField()?.enabled === true);
  readonly customRequired = computed(
    () => this.showCustom() && this.customField()?.required === true,
  );
  readonly customLabel = computed(() => this.customField()?.label ?? '');

  /**
   * Plain methods (not computed): FormControl values are not signals, so a
   * computed would memoize the first evaluation and never reflect later edits.
   */
  nameError(): string | null {
    if (!this.submitAttempted()) return null;
    if (this.form.controls.name.value.trim().length === 0) return 'Please enter your name.';
    return null;
  }

  emailError(): string | null {
    if (!this.submitAttempted()) return null;
    const value = this.form.controls.email.value.trim();
    if (value.length === 0) return 'Please enter your email.';
    if (!EMAIL_PATTERN.test(value)) return 'Please enter a valid email address.';
    return null;
  }

  customError(): string | null {
    if (!this.submitAttempted() || !this.customRequired()) return null;
    if (this.form.controls.custom.value.trim().length === 0) return 'This field is required.';
    return null;
  }

  ngAfterViewInit(): void {
    this.heading().nativeElement.focus();
  }

  /** Validates on submit only; writes the booking batch, then notifies the page. */
  async submit(): Promise<void> {
    if (this.pending()) return;
    this.submitAttempted.set(true);
    this.submitError.set(false);

    if (this.nameError() || this.emailError() || this.customError()) return;

    // Missing flow selections never attempt a write.
    const restaurantId = this.restaurantId();
    const date = this.date();
    const time = this.time();
    const partySize = this.partySize();
    if (!restaurantId || !date || !time || !partySize) return;

    const name = this.form.controls.name.value.trim();
    const email = this.form.controls.email.value.trim();
    const customValue = this.form.controls.custom.value.trim();

    this.pending.set(true);
    try {
      await this.bookingService.createBooking({
        restaurantId,
        date,
        time,
        partySize,
        name,
        email,
        ...(this.showCustom() && customValue.length > 0 ? { customFieldValue: customValue } : {}),
      });
      this.submitted.emit();
    } catch {
      this.submitError.set(true);
    } finally {
      this.pending.set(false);
    }
  }

  /** Retry resubmits the current (preserved) form values. */
  retry(): Promise<void> {
    return this.submit();
  }
}
