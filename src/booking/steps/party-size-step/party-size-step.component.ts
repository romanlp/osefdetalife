import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'osef-party-size-step',
  templateUrl: './party-size-step.component.html',
  styleUrl: './party-size-step.component.scss',
})
export class PartySizeStepComponent implements AfterViewInit {
  /** Currently chosen size, highlighted when returning via back navigation. */
  readonly selected = input<number | null>(null);

  readonly partySizeSelect = output<number>();
  readonly back = output<void>();

  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('heading');

  readonly sizes = [1, 2, 3, 4, 5, 6, 7, 8] as const;

  ngAfterViewInit(): void {
    this.heading().nativeElement.focus();
  }

  choose(size: number): void {
    this.partySizeSelect.emit(size);
  }
}
