import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getStoreStatus } from './database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Business hours configuration
// Each day has an array of time ranges in 24-hour format [startHour, startMin, endHour, endMin]
const businessHours: { [key: string]: number[][] } = {
  'monday': [], // Closed
  'tuesday': [], // Closed
  'wednesday': [[12, 0, 18, 0]],
  'thursday': [[12, 0, 18, 0]],
  'friday': [[12, 0, 18, 0], [19, 0, 22, 0]],
  'saturday': [[12, 0, 18, 0], [19, 0, 22, 0]],
  'sunday': [[12, 0, 16, 0]]
};

function isWithinBusinessHours(): boolean {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute; // minutes since midnight

  const dayHours = businessHours[dayName] || [];
  for (const [startH, startM, endH, endM] of dayHours) {
    const startTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;
    if (currentTime >= startTime && currentTime < endTime) {
      return true;
    }
  }
  return false;
}

export async function getOrderingStatus(): Promise<{ allowed: boolean; isPreOrder: boolean }> {
  const isWithinHours = isWithinBusinessHours();
  const storeOpen = await getStoreStatus();

  // Manual store setting overrides business hours completely
  const allowed = storeOpen;

  console.log('Ordering status:', {
    isWithinBusinessHours: isWithinHours,
    storeOpen: storeOpen,
    allowed: allowed,
    isPreOrder: false
  });

  return { allowed, isPreOrder: false };
}

export async function isOrderingAllowed(): Promise<boolean> {
  const isWithinHours = isWithinBusinessHours();
  const storeOpen = await getStoreStatus();
  const allowed = storeOpen;

  console.log('isOrderingAllowed:', {
    isWithinBusinessHours: isWithinHours,
    storeOpen: storeOpen,
    allowed: allowed
  });

  return allowed;
}
