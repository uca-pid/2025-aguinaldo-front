/**
 * Development utility to add delays for testing loading states
 * Only active in development mode
 */

// Configuration for different delay scenarios
export const DELAY_CONFIGS = {
  FAST: 800,      // Quick operations (notifications, simple data)
  NORMAL: 1500,   // Standard operations (loading lists, profiles)
  SLOW: 2500,     // Heavy operations (large data sets, complex processing)
  VERY_SLOW: 4000 // Very heavy operations (file uploads, complex analytics)
} as const;

/**
 * Adds a delay for development purposes to see loading states
 * @param ms - Milliseconds to delay (default: 1500ms)
 * @returns Promise that resolves after the delay
 */
export const addDevDelay = async (ms: number = DELAY_CONFIGS.NORMAL): Promise<void> => {
  // Only add delay in development mode
  if (process.env.NODE_ENV === 'development') {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  return Promise.resolve();
};

/**
 * Wraps a function with a development delay
 * @param fn - The function to wrap
 * @param delayMs - Milliseconds to delay (default: 1500ms)
 * @returns The result of the original function after the delay
 */
export const withDevDelay = async <T>(
  fn: () => Promise<T>,
  delayMs: number = DELAY_CONFIGS.NORMAL
): Promise<T> => {
  await addDevDelay(delayMs);
  return await fn();
};

export default { addDevDelay, withDevDelay };