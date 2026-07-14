import { Firestore, collection, doc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string;
  ownerId: string;
  hours: Record<number, { open: string; close: string } | undefined>;
  colors?: {
    primary: string;
    secondary: string;
  };
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
