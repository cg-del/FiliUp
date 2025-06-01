import { clsx } from 'clsx';

/**
 * Combine multiple class names
 */
export function cn(...inputs) {
  return clsx(inputs);
} 