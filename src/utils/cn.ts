import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwindcss-merge';

/**
 * Utility function to merge Tailwind CSS classes with proper conflict resolution
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));