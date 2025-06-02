/**
 * Utility function to combine class names conditionally
 * This is a simplified version of the clsx/classnames libraries
 * 
 * @param {...string} classes - Class names to combine
 * @returns {string} - Combined class names
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
} 