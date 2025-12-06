import { useEffect } from 'react';

/**
 * Custom hook for setting up intervals
 * Automatically cleans up on unmount
 */
export const useInterval = (callback, delay, enabled = true) => {
  useEffect(() => {
    if (!enabled || delay === null) {
      return;
    }

    const interval = setInterval(callback, delay);
    return () => clearInterval(interval);
  }, [callback, delay, enabled]);
};
