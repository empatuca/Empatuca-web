import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatOrderNumber(num: number | undefined | null) {
  if (!num) return 'N/A';
  const str = String(num);
  if (str.length > 3) {
    let datePart = str.slice(0, -3);
    if (datePart.length === 3) {
      datePart = '0' + datePart;
    }
    return `${datePart}-${parseInt(str.slice(-3), 10)}`;
  }
  return str;
}

/**
 * Returns YYYY-MM-DD representing the date in Ecuador timezone (America/Guayaquil, UTC-5).
 */
export function getEcuadorDateString(date: Date | string | number = new Date()): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (!d || isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Guayaquil',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(d);
  const day = parts.find(p => p.type === 'day')?.value || '01';
  const month = parts.find(p => p.type === 'month')?.value || '01';
  const year = parts.find(p => p.type === 'year')?.value || '1970';
  return `${year}-${month}-${day}`;
}

/**
 * Returns formatted date in day-month-year format (DD/MM/YYYY) in Ecuador timezone.
 */
export function formatEcuadorDate(date: Date | string | number = new Date()): string {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (!d || isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Guayaquil',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(d);
  const day = parts.find(p => p.type === 'day')?.value || '01';
  const month = parts.find(p => p.type === 'month')?.value || '01';
  const year = parts.find(p => p.type === 'year')?.value || '1970';
  return `${day}/${month}/${year}`;
}

/**
 * Returns formatted time in 24-hour format (HH:mm or HH:mm:ss) in Ecuador timezone.
 */
export function formatEcuadorTime(date: Date | string | number = new Date(), includeSeconds = false): string {
  let d: Date;
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    d = new Date(`${date}T12:00:00-05:00`);
  } else {
    d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  }
  if (!d || isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('es-EC', {
    timeZone: 'America/Guayaquil',
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: false
  }).format(d);
}

/**
 * Returns DD/MM/YYYY, HH:mm in 24-hour format in Ecuador timezone.
 */
export function formatEcuadorDateTime(date: Date | string | number = new Date()): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (!d || isNaN(d.getTime())) return '';
  const dateFormatted = formatEcuadorDate(d);
  const timeFormatted = formatEcuadorTime(d);
  if (!dateFormatted || !timeFormatted) return '';
  return `${dateFormatted}, ${timeFormatted}`;
}

/**
 * Returns the exact UTC start (00:00:00.000) and end (23:59:59.999) timestamps for an Ecuador date (YYYY-MM-DD).
 */
export function getEcuadorDayRange(dateString?: string): { startOfDayUTC: string; endOfDayUTC: string } {
  const dateStr = dateString && /^\d{4}-\d{2}-\d{2}$/.test(dateString) ? dateString : getEcuadorDateString();
  const start = new Date(`${dateStr}T00:00:00-05:00`);
  const end = new Date(`${dateStr}T23:59:59.999-05:00`);
  return {
    startOfDayUTC: start.toISOString(),
    endOfDayUTC: end.toISOString()
  };
}

/**
 * Computes the order number prefix (DDMM000) based on Ecuador current date.
 */
export function getEcuadorOrderPrefix(date: Date | string | number = new Date()): number {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat('es-EC', {
    timeZone: 'America/Guayaquil',
    day: '2-digit',
    month: '2-digit'
  }).formatToParts(d);
  const day = parts.find(p => p.type === 'day')?.value || '01';
  const month = parts.find(p => p.type === 'month')?.value || '01';
  return parseInt(`${day}${month}000`, 10);
}
