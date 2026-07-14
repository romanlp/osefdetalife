import { Page, expect } from '@playwright/test';

export async function waitForFirebaseReady(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    return (window as any).firebase !== undefined || document.readyState === 'complete';
  });
}

export async function clearFirestore(): Promise<void> {
  const response = await fetch(
    `http://localhost:8080/v1/projects/firebase-crackling-fire-4704/databases/(default)/documents`,
    {
      method: 'DELETE',
    }
  );
  if (!response.ok) {
    console.warn('Failed to clear Firestore:', response.statusText);
  }
}

export async function clearAuth(): Promise<void> {
  const response = await fetch(
    'http://localhost:9099/identitytoolkit.googleapis.com/v1/projects/firebase-crackling-fire-4704/accounts:delete',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  if (!response.ok) {
    console.warn('Failed to clear Auth:', response.statusText);
  }
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatTime(hours: number, minutes: number = 0): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function getNextAvailableDate(hours: Record<number, { open: string; close: string }>): Date {
  const now = new Date();
  let date = new Date(now);
  
  while (true) {
    const dayOfWeek = date.getDay();
    if (hours[dayOfWeek]) {
      const [openHour] = hours[dayOfWeek].open.split(':').map(Number);
      const [closeHour] = hours[dayOfWeek].close.split(':').map(Number);
      
      if (date.toDateString() === now.toDateString()) {
        const currentHour = now.getHours();
        if (currentHour < closeHour) {
          return date;
        }
      } else {
        return date;
      }
    }
    date.setDate(date.getDate() + 1);
  }
}
