import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getOrderingStatus(): Promise<{ allowed: boolean; isPreOrder: boolean }> {
  // Force ordering to always be allowed
  console.log('Ordering status forced to: allowed=true, isPreOrder=false');
  return { allowed: true, isPreOrder: false };
}

export async function isOrderingAllowed(): Promise<boolean> {
  // Force ordering to always be allowed
  console.log('isOrderingAllowed forced to: true');
  return true;
}
