import { useState, useEffect } from 'react';

/**
 * Custom hook for managing auto-refresh functionality
 * Persists state to localStorage
 */
export const useAutoRefresh = (defaultValue = true) => {
  const [autoRefresh, setAutoRefresh] = useState(() => {
    const saved = localStorage.getItem('autoRefresh');
    return saved !== null ? JSON.parse(saved) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem('autoRefresh', JSON.stringify(autoRefresh));
  }, [autoRefresh]);

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  return {
    autoRefresh,
    setAutoRefresh,
    toggleAutoRefresh
  };
};
