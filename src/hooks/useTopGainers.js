import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTopMovers } from '../services/binanceApi';

/**
 * Query key for top gainers data
 */
export const TOP_GAINERS_QUERY_KEY = ['topGainers'];

/**
 * Custom hook for fetching and managing top gainers data with React Query
 * @param {boolean} enableAutoRefresh - Whether to enable automatic 30s refetching
 */
export const useTopGainers = (enableAutoRefresh = true) => {
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedEventType, setSelectedEventType] = useState(null);

  // Fetch all top gainers data with React Query
  const {
    data: { coins = [], periods = [], stats = {}, eventTypes = [] } = {},
    isLoading,
    isFetching,
    error,
    refetch
  } = useQuery({
    queryKey: TOP_GAINERS_QUERY_KEY,
    queryFn: fetchTopMovers,
    staleTime: 25000,
    refetchInterval: enableAutoRefresh ? 30000 : false, // Auto-refresh every 30s
    refetchIntervalInBackground: false, // Don't refetch when tab not visible
  });

  // Initialize selectedPeriod when data loads
  const availablePeriods = periods || [];
  if (!selectedPeriod && availablePeriods.length > 0) {
    setSelectedPeriod(availablePeriods[0]);
  }

  // Client-side filtering by selected period
  const filteredCoins = useMemo(() => {
    if (!coins) return [];
    if (!selectedPeriod) return coins;

    return coins.filter(coin => {
      if (!selectedEventType) return coin.period === selectedPeriod;
      if ("NEW_HIGH" == selectedEventType) {
        return coin.period === selectedPeriod &&
          coin.eventType === "DAY_UP_BREAKTHROUGH" &&
          coin.noticeType === "PRICE_BREAKTHROUGH"
      }
      if ("NEW_LOW" == selectedEventType) {
        return coin.period === selectedPeriod &&
          coin.eventType === "DAY_DOWN_BREAKTHROUGH" &&
          coin.noticeType === "PRICE_BREAKTHROUGH"
      }
      if ("RISE" == selectedEventType || "FALL" == selectedEventType) {
        return coin.period === selectedPeriod
      }

      return coin.eventType === selectedEventType && coin.period === selectedPeriod;
    });
  }, [coins, selectedPeriod, selectedEventType]);

  return {
    coins: filteredCoins,
    allCoins: coins || [],
    loading: isLoading, // Only true on initial load
    isFetching, // True during background refetches
    error,
    stats: stats || {
      totalVolume: 0,
      avgGain: 0,
      topGainer: null
    },
    fetchTopGainers: refetch, // Expose refetch as fetchTopGainers for backward compatibility
    selectedPeriod,
    setSelectedPeriod,
    availablePeriods,
    eventTypes,
    selectedEventType,
    setSelectedEventType
  };
};
