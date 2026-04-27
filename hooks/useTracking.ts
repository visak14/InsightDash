import { useCallback } from 'react';

export const useTracking = () => {
  const track = useCallback(async (featureName: string) => {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureName }),
      });
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  }, []);

  return { track };
};
