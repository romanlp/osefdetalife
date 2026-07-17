export interface Booking {
  id: string;
  restaurantId: string;
  date: string;
  time: string;
  duration: number;
  partySize: number;
  name: string;
  email: string;
  customFieldValue?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: Date;
}
