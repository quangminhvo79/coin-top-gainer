import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 * Optimized for crypto price tracking with 30s auto-refresh pattern
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 25s (slightly less than 30s auto-refresh)
      staleTime: 25000,

      // Keep unused data in cache for 5 minutes
      gcTime: 5 * 60 * 1000,

      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch strategies
      refetchOnWindowFocus: false,  // Fresh data when user returns to tab
      refetchOnReconnect: false,    // Refetch when connection restored
      refetchOnMount: false,        // Skip refetch if data is fresh
    },
  },
});
