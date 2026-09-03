// Indian Standard Time (IST) is UTC+05:30
export const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000; // 19,800,000 ms

export interface ISTDateComponents {
  year: number;
  month: number; // 0-11 (Jan is 0)
  date: number; // 1-31
  hours: number; // 0-23
  minutes: number; // 0-59
  seconds: number; // 0-59
  dayOfWeek: number; // 0-6 (Sun is 0)
  dateKey: string; // 'YYYY-MM-DD'
  epochMs: number;
}

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

/**
 * Format year, month (0-indexed), and day into 'YYYY-MM-DD'
 */
export function formatISTDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/**
 * Decomposes any epoch timestamp (default Date.now()) into IST components.
 * Independent of the device's system timezone.
 */
export function getISTDate(timestamp: number = Date.now()): ISTDateComponents {
  const istMs = timestamp + IST_OFFSET_MS;
  const d = new Date(istMs);

  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const date = d.getUTCDate();
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  const seconds = d.getUTCSeconds();
  const dayOfWeek = d.getUTCDay();

  return {
    year,
    month,
    date,
    hours,
    minutes,
    seconds,
    dayOfWeek,
    dateKey: formatISTDateKey(year, month, date),
    epochMs: timestamp,
  };
}

/**
 * Get current date key 'YYYY-MM-DD' in Indian Standard Time.
 */
export function getISTDateKey(timestamp: number = Date.now()): string {
  return getISTDate(timestamp).dateKey;
}

/**
 * Convert IST date & time components into a real UTC epoch timestamp.
 */
export function getEpochFromIST(
  year: number,
  month: number, // 0-11
  date: number, // 1-31
  hours: number = 0,
  minutes: number = 0,
  seconds: number = 0
): number {
  return Date.UTC(year, month, date, hours, minutes, seconds) - IST_OFFSET_MS;
}

/**
 * Calculate the next upcoming 11:50:00 PM IST epoch timestamp.
 */
export function getNextIST1150PMTimestamp(fromTimestamp: number = Date.now()): number {
  const ist = getISTDate(fromTimestamp);
  const targetEpochToday = getEpochFromIST(ist.year, ist.month, ist.date, 23, 50, 0);

  if (fromTimestamp < targetEpochToday) {
    return targetEpochToday;
  }
  // If 11:50 PM IST has already passed today, schedule for tomorrow 11:50 PM IST
  return targetEpochToday + 24 * 60 * 60 * 1000;
}

/**
 * Calculate the next upcoming 12:00:00 AM IST (midnight) epoch timestamp.
 */
export function getNextISTMidnightTimestamp(fromTimestamp: number = Date.now()): number {
  const ist = getISTDate(fromTimestamp);
  const midnightEpochToday = getEpochFromIST(ist.year, ist.month, ist.date, 0, 0, 0);
  return midnightEpochToday + 24 * 60 * 60 * 1000;
}

/**
 * Calculates calendar day difference between two IST date keys 'YYYY-MM-DD'.
 * Returns positive if dateKeyB is after dateKeyA.
 */
export function getDaysDiffIST(dateKeyA: string, dateKeyB: string): number {
  try {
    const [yA, mA, dA] = dateKeyA.split('-').map(Number);
    const [yB, mB, dB] = dateKeyB.split('-').map(Number);
    const epochA = Date.UTC(yA, mA - 1, dA);
    const epochB = Date.UTC(yB, mB - 1, dB);
    return Math.round((epochB - epochA) / (24 * 60 * 60 * 1000));
  } catch {
    return 0;
  }
}
