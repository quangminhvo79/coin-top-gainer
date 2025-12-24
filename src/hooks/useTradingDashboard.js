import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../utils/apiClient';

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
 * API Helper Function
 * Uses apiClient with automatic token refresh
 */
const fetchAPI = async (endpoint, options = {}) => {
  const response = await apiClient(endpoint, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

/**
 * Hook: Fetch Trading Platforms
 */
export const useTradingPlatforms = () => {
  return useQuery({
    queryKey: TRADING_KEYS.platforms,
    queryFn: () => fetchAPI('/api/v1/platforms'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook: Fetch Active Orders
 */
export const useActiveOrders = (refreshTrigger = 0) => {
  return useQuery({
    queryKey: [...TRADING_KEYS.activeOrders, refreshTrigger],
    queryFn: () => fetchAPI('/api/v1/futures/orders?status=ACTIVE,PENDING'),
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });
};

/**
 * Hook: Fetch Order History
 */
export const useOrderHistory = (refreshTrigger = 0) => {
  return useQuery({
    queryKey: [...TRADING_KEYS.orderHistory, refreshTrigger],
    queryFn: () => fetchAPI('/api/v1/futures/orders'),
    staleTime: 30000, // 30 seconds
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
