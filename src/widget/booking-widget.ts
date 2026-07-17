import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export class BookingWidget extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-width: 375px;
      max-width: 100%;
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background-color: #f5f0eb;
      border-radius: 12px;
      padding: 24px;
      box-sizing: border-box;
    }

    .header {
      text-align: center;
      margin-bottom: 24px;
    }

    .restaurant-name {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 8px 0;
    }

    .address {
      font-size: 14px;
      color: #6b6b6b;
      margin: 0;
    }

    .book-button {
      display: block;
      width: 100%;
      padding: 16px;
      background-color: #1a1a1a;
      color: #f5f0eb;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .book-button:hover {
      background-color: #333;
    }

    .loading {
      text-align: center;
      padding: 24px;
      color: #6b6b6b;
    }

    .error {
      text-align: center;
      padding: 24px;
      color: #c44b4b;
    }
  `;

  @property({ type: String })
  declare restaurant: string;

  @property({ type: Boolean })
  private declare loading: boolean;

  @property({ type: String })
  private declare error: string;

  @property({ type: Object })
  private declare restaurantData: { name: string; address?: string } | null;

  constructor() {
    super();
    this.restaurant = '';
    this.loading = false;
    this.error = '';
    this.restaurantData = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.restaurant) {
      this.loadRestaurant();
    }
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('restaurant') && this.restaurant) {
      this.loadRestaurant();
    }
  }

  private async loadRestaurant() {
    this.loading = true;
    this.error = '';

    try {
      // TODO: Load restaurant data from Firestore using slug
      // For now, use placeholder data
      this.restaurantData = {
        name: 'Restaurant Name',
        address: '123 Main St, London',
      };
    } catch {
      this.error = 'Restaurant not found';
    } finally {
      this.loading = false;
    }
  }

  private handleBookClick() {
    // TODO: Emit event or navigate to booking flow
    console.log('Book clicked for restaurant:', this.restaurant);
  }

  render() {
    if (this.loading) {
      return html`<div class="loading" role="status" aria-live="polite">Loading...</div>`;
    }

    if (this.error) {
      return html`<div class="error" role="alert">${this.error}</div>`;
    }

    if (!this.restaurantData) {
      return html`<div class="error">Restaurant not found</div>`;
    }

    return html`
      <div class="header">
        <h1 class="restaurant-name">${this.restaurantData.name}</h1>
        ${this.restaurantData.address
          ? html`<p class="address">${this.restaurantData.address}</p>`
          : ''}
      </div>
      <button class="book-button" @click=${this.handleBookClick}>
        Book a Table
      </button>
    `;
  }
}

// Register the custom element
if (!customElements.get('booking-widget')) {
  customElements.define('booking-widget', BookingWidget);
}
