export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address?: string;
  ownerId: string;
  timezone: string;
  hours: Record<number, { open: string; close: string } | undefined>;
  colors?: {
    primary: string;
    secondary: string;
  };
  whiteLabel: {
    primaryColor: string;
    secondaryColor: string;
  };
  /** Embedded table groups — source of truth for public availability math. */
  tableGroups?: { capacity: number; count: number }[];
  customField?: {
    label: string;
    required: boolean;
    enabled: boolean;
  };
}

export interface TableGroup {
  id: string;
  restaurantId: string;
  capacity: number;
  count: number;
}

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

export interface User {
  uid: string;
  email: string;
  password: string;
}
