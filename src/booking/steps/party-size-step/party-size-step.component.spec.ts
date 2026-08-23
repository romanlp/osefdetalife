import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartySizeStepComponent } from './party-size-step.component';

describe('PartySizeStepComponent', () => {
  let fixture: ComponentFixture<PartySizeStepComponent>;

  function queryEl(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  async function createComponent(selected: number | null = null): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [PartySizeStepComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PartySizeStepComponent);
    fixture.componentRef.setInput('selected', selected);
    fixture.detectChanges();
  }

  describe('HAPPY_PATH', () => {
    it('[P0] should render the heading and a grid of eight circular options 1–8', async () => {
      await createComponent();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('h2')?.textContent).toContain('How many guests?');

      for (const size of [1, 2, 3, 4, 5, 6, 7, 8]) {
        expect(el.querySelector(`[data-testid="party-size-option-${size}"]`)).toBeTruthy();
      }
      expect(el.querySelectorAll('.size-btn')).toHaveLength(8);
    });

    it('[P0] should emit the chosen size when an option is tapped', async () => {
      await createComponent();

      const emitted: number[] = [];
      fixture.componentInstance.partySizeSelect.subscribe((size) => emitted.push(size));

      const button = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="party-size-option-4"]',
      )!;
      button.click();
      fixture.detectChanges();

      expect(emitted).toEqual([4]);
    });
  });

  describe('SELECTION_STATE', () => {
    it('[P0] should highlight only the selected option with aria-pressed', async () => {
      await createComponent(3);

      const selected = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="party-size-option-3"]',
      )!;
      const unselected = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="party-size-option-5"]',
      )!;

      expect(selected.classList.contains('selected')).toBe(true);
      expect(selected.getAttribute('aria-pressed')).toBe('true');
      expect(unselected.classList.contains('selected')).toBe(false);
      expect(unselected.getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('BACK_NAVIGATION', () => {
    it('[P1] should emit back when the back button is tapped', async () => {
      await createComponent();

      let backCount = 0;
      fixture.componentInstance.back.subscribe(() => backCount++);

      queryEl().querySelector<HTMLButtonElement>('[data-testid="party-size-back"]')!.click();
      fixture.detectChanges();

      expect(backCount).toBe(1);
    });
  });

  describe('FOCUS_MANAGEMENT', () => {
    it('[P0] should move focus to the step heading on init', async () => {
      await createComponent();

      const heading = queryEl().querySelector<HTMLHeadingElement>('h2')!;
      expect(document.activeElement).toBe(heading);
      expect(heading.getAttribute('tabindex')).toBe('-1');
    });
  });
});
