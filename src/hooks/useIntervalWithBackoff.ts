import { useEffect, useRef } from 'react';

/**
 * Calls `tick` repeatedly. On success the interval resets to `baseInterval`;
 * on failure it doubles up to `maxInterval`. Also resets immediately when the
 * browser comes back online or the tab becomes visible.
 */
export function useIntervalWithBackoff(
  tick: () => Promise<boolean> | boolean,
  baseInterval: number,
  maxInterval = 60000
) {
  const intervalRef = useRef(baseInterval);
  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    intervalRef.current = baseInterval;
    let id: ReturnType<typeof setInterval> | null = null;

    const schedule = () => {
      if (id) clearInterval(id);
      id = setInterval(async () => {
        try {
          const ok = await tickRef.current();
          intervalRef.current = ok ? baseInterval : Math.min(intervalRef.current * 2, maxInterval);
        } catch {
          intervalRef.current = Math.min(intervalRef.current * 2, maxInterval);
        }
        schedule();
      }, intervalRef.current);
    };

    const reset = () => {
      intervalRef.current = baseInterval;
      schedule();
    };

    const handleOnline = () => reset();
    const handleVisibility = () => {
      if (!document.hidden) reset();
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);
    schedule();

    return () => {
      if (id) clearInterval(id);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [baseInterval, maxInterval]);
}
