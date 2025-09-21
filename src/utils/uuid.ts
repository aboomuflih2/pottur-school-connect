/**
 * UUID utility functions for cross-browser compatibility
 * Replaces crypto.randomUUID() which is not available in all browsers
 */

/**
 * Generate a UUID v4 string
 * @returns {string} A UUID v4 string
 */
export function generateUUID(): string {
  // Check if crypto.randomUUID is available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a short random ID (8 characters)
 * @returns {string} A short random ID
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Generate a timestamp-based ID
 * @returns {string} A timestamp-based ID
 */
export function generateTimestampId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}