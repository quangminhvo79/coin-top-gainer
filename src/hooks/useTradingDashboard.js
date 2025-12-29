import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '../utils/apiClient';

/**
 * Query Keys
 */
export const TRADING_KEYS = {
  platforms: ['trading-platforms'],
  activeOrders: ['active-orders'],
  orderHistory: ['order-history'],
  orderById: (id) => ['order', id]
};

/**
 * Hook: Fetch Trading Platforms
 */
export const useTradingPlatforms = () => {
  return useQuery({
    queryKey: TRADING_KEYS.platforms,
    queryFn: () => {
      console.log('[useTradingPlatforms] Fetching platforms...');
      return fetchAPI('/api/v1/platforms');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Hook: Fetch Active Orders
 * Fetches orders with PENDING or PARTIALLY_FILLED status
 */
export const useActiveOrders = (refreshTrigger = 0) => {
  return useQuery({
    queryKey: [...TRADING_KEYS.activeOrders, refreshTrigger],
    queryFn: () => {
      console.log('[useActiveOrders] Fetching active orders...');
      return fetchAPI('/api/v1/futures/orders?status=PENDING,PARTIALLY_FILLED');
    },
    refetchOnWindowFocus: false, // Don't auto-refetch when window gains focus
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
    refetchOnMount: false, // Don't refetch when component mounts if data is fresh
    // refetchInterval: 10000, // Auto-refresh every 10 seconds
  });
};

/**
 * Hook: Fetch Order History
 */
export const useOrderHistory = (refreshTrigger = 0) => {
  return useQuery({
    queryKey: [...TRADING_KEYS.orderHistory, refreshTrigger],
    queryFn: () => {
      console.log('[useOrderHistory] Fetching order history...');
      return fetchAPI('/api/v1/futures/orders');
    },
    refetchOnWindowFocus: false, // Don't auto-refetch when window gains focus
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
    refetchOnMount: false, // Don't refetch when component mounts if data is fresh
  });
};

/**
 * Hook: Fetch Order by ID
 */
export const useOrderById = (orderId) => {
  return useQuery({
    queryKey: TRADING_KEYS.orderById(orderId),
    queryFn: () => fetchAPI(`/api/v1/futures/orders/${orderId}`),
    enabled: !!orderId,
  });
};

/**
 * Hook: Place Order Mutation
 */
export const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) =>
      fetchAPI('/api/v1/futures/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      }),
    onSuccess: () => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: TRADING_KEYS.activeOrders });
      queryClient.invalidateQueries({ queryKey: TRADING_KEYS.orderHistory });
    },
  });
};

/**
 * Hook: Cancel Order Mutation
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) =>
      fetchAPI(`/api/v1/futures/orders/${orderId}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: TRADING_KEYS.activeOrders });
      queryClient.invalidateQueries({ queryKey: TRADING_KEYS.orderHistory });
    },
  });
};

/**
 * Hook: Sync Orders from Binance
 * Fetches all open orders from Binance exchange
 * NOTE: This is READ-ONLY, doesn't modify database, so no need to invalidate queries
 */
export const useSyncBinanceOrders = () => {
  return useMutation({
    mutationFn: (platformId) => {
      console.log('[useSyncBinanceOrders] Syncing from Binance...');
      return fetchAPI(`/api/v1/futures/sync-orders?platformId=${platformId}`);
    },
    // Don't invalidate queries - this is just reading from Binance, not modifying database
  });
};
