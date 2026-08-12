import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatOrderNumber(num: number | undefined | null) {
  if (!num) return 'N/A';
  const str = String(num);
  if (str.length > 3) {
    return `${str.slice(0, -3)}-${parseInt(str.slice(-3), 10)}`;
  }
  return str;
}
