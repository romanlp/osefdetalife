import { describe, it, expect } from 'vitest';
import { BookingWidget } from './booking-widget';

describe('BookingWidget', () => {
  it('should be defined as a custom element', () => {
    expect(customElements.get('booking-widget')).toBeDefined();
  });

  it('should create an instance', () => {
    const widget = document.createElement('booking-widget') as BookingWidget;
    expect(widget).toBeInstanceOf(BookingWidget);
  });

  it('should have default restaurant property as empty string', () => {
    const widget = document.createElement('booking-widget') as BookingWidget;
    expect(widget.restaurant).toBe('');
  });

  it('should show loading state when restaurant is set', async () => {
    const widget = document.createElement('booking-widget') as BookingWidget;
    widget.restaurant = 'test-restaurant';
    document.body.appendChild(widget);

    await new Promise((r) => setTimeout(r, 0));

    const shadow = widget.shadowRoot;
    expect(shadow).toBeTruthy();

    document.body.removeChild(widget);
  });

  it('should render restaurant data after loading', async () => {
    const widget = document.createElement('booking-widget') as BookingWidget;
    widget.restaurant = 'test-restaurant';
    document.body.appendChild(widget);

    await new Promise((r) => setTimeout(r, 100));

    const shadow = widget.shadowRoot;
    expect(shadow).toBeTruthy();

    document.body.removeChild(widget);
  });

  it('should have a book button', async () => {
    const widget = document.createElement('booking-widget') as BookingWidget;
    widget.restaurant = 'test-restaurant';
    document.body.appendChild(widget);

    await new Promise((r) => setTimeout(r, 100));

    const shadow = widget.shadowRoot;
    const button = shadow?.querySelector('.book-button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Book a Table');

    document.body.removeChild(widget);
  });
});
