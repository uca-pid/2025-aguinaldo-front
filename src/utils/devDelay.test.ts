import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { addDevDelay, withDevDelay, DELAY_CONFIGS } from './devDelay';

describe('devDelay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('addDevDelay', () => {
    it('should resolve immediately in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const start = Date.now();
      await addDevDelay(1000);
      const end = Date.now();

      expect(end - start).toBeLessThan(100); // Should be much less than 1000ms

      process.env.NODE_ENV = originalEnv;
    });

    it('should delay for specified milliseconds in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const delayMs = 500;
      const promise = addDevDelay(delayMs);

      vi.advanceTimersByTime(delayMs);
      await expect(promise).resolves.toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should use default delay when no parameter provided', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const promise = addDevDelay();

      vi.advanceTimersByTime(DELAY_CONFIGS.NORMAL);
      await expect(promise).resolves.toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should work with different delay configurations', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const testCases = [
        { config: DELAY_CONFIGS.FAST, expected: 800 },
        { config: DELAY_CONFIGS.NORMAL, expected: 1500 },
        { config: DELAY_CONFIGS.SLOW, expected: 2500 },
        { config: DELAY_CONFIGS.VERY_SLOW, expected: 4000 }
      ];

      for (const { config, expected } of testCases) {
        const promise = addDevDelay(config);
        vi.advanceTimersByTime(expected);
        await expect(promise).resolves.toBeUndefined();
      }

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('withDevDelay', () => {
    it('should execute function after delay in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const mockFn = vi.fn().mockResolvedValue('result');
      const delayMs = 300;

      const promise = withDevDelay(mockFn, delayMs);

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(delayMs);
      const result = await promise;

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result).toBe('result');

      process.env.NODE_ENV = originalEnv;
    });

    it('should execute function immediately in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const mockFn = vi.fn().mockResolvedValue('result');

      const result = await withDevDelay(mockFn, 1000);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result).toBe('result');

      process.env.NODE_ENV = originalEnv;
    });

    it('should use default delay when no delayMs provided', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const mockFn = vi.fn().mockResolvedValue('result');

      const promise = withDevDelay(mockFn);

      vi.advanceTimersByTime(DELAY_CONFIGS.NORMAL);
      const result = await promise;

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result).toBe('result');

      process.env.NODE_ENV = originalEnv;
    });
  });
});