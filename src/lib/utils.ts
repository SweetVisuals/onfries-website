import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getOrderingStatus(): { allowed: boolean; isPreOrder: boolean } {
  const now = new Date();
  const day = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const hour = now.getHours();
  const minute = now.getMinutes();
  const time = hour * 60 + minute; // minutes since midnight

  // Closed on Monday and Tuesday
  if (day === 1 || day === 2) {
    return { allowed: false, isPreOrder: false };
  }

  // Wednesday to Friday: open 12:00-18:00, pre-order after 18:00 for next day
  if (day === 3 || day === 4 || day === 5) {
    if (time >= 720 && time <= 1080) return { allowed: true, isPreOrder: false }; // 12:00-18:00
    if (time > 1080) return { allowed: true, isPreOrder: true }; // pre-order after 18:00
  }

  // Saturday: open 12:00-18:00 and 19:00-22:00, pre-order 18:00-19:00 for Saturday, after 19:00 for Sunday
  if (day === 6) {
    if (time >= 720 && time <= 1080) return { allowed: true, isPreOrder: false }; // 12:00-18:00
    if (time >= 1140 && time <= 1320) return { allowed: true, isPreOrder: false }; // 19:00-22:00
    if (time >= 1080 && time <= 1140) return { allowed: true, isPreOrder: true }; // pre-order 18:00-19:00
    if (time > 1140) return { allowed: true, isPreOrder: true }; // pre-order after 19:00 for Sunday
  }

  // Sunday: open 12:00-16:00
  if (day === 0) {
    if (time >= 720 && time <= 960) return { allowed: true, isPreOrder: false }; // 12:00-16:00
  }

  return { allowed: false, isPreOrder: false };
}

export function isOrderingAllowed(): boolean {
  return getOrderingStatus().allowed;
}
