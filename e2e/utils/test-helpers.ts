import { Page, expect } from '@playwright/test';

export async function waitForFirebaseReady(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    return (window as any).firebase !== undefined || document.readyState === 'complete';
  });
}

export async function clearFirestore(): Promise<void> {
  const response = await fetch(
    `http://localhost:8081/emulator/v1/projects/firebase-crackling-fire-4704/databases/(default)/documents`,
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
    'http://localhost:9099/emulator/v1/projects/firebase-crackling-fire-4704/accounts',
    {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer owner',
      },
    }
  );
  if (!response.ok) {
    console.warn('Failed to clear Auth:', response.statusText);
  }
}

export function formatTime(hours: number, minutes: number = 0): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * First open date (per ISO day numbers 1=Mon..7=Sun) on or after "today" in `timezone`,
 * mirroring the app's calendar logic. Returns YYYY-MM-DD. The timezone is required —
 * always pass the seeded restaurant's timezone so the helper can never drift from it.
 */
export function getNextAvailableDate(
  hours: Record<number, { open: string; close: string } | undefined>,
  timezone: string,
): string {
  const now = new Date();
  const todayIso = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  let [year, month, day] = todayIso.split('-').map(Number);
  for (let i = 0; i < 366; i++) {
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const utcDayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const dayNumber = ((utcDayOfWeek + 6) % 7) + 1;
    if (hours[dayNumber]) {
      return iso;
    }
    const next = new Date(Date.UTC(year, month - 1, day + 1));
    year = next.getUTCFullYear();
    month = next.getUTCMonth() + 1;
    day = next.getUTCDate();
  }
  throw new Error('No open day found within the next 366 days');
}
