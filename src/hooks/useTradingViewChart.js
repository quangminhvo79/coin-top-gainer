import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';

/**
 * Custom hook for managing TradingView chart logic
 * Handles chart creation, data fetching, and lifecycle
 */
export const useTradingViewChart = (symbol, defaultInterval = '15m') => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const [selectedInterval, setSelectedInterval] = useState(defaultInterval);

  // Available timeframes
  const timeframes = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '30m', value: '30m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1d', value: '1d' },
  ];

  /**
   * Fetch candle data from Binance API
   */
  const fetchCandleData = useCallback(async (symbol, interval, candlestickSeries) => {
    try {
      const response = await fetch(
        `https://fapi.binance.com/fapi/v1/continuousKlines?pair=${symbol}&interval=${interval}&contractType=PERPETUAL&limit=100`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        console.error('Invalid data format from Binance API');
        return;
      }

      // Transform Binance kline data to TradingView format
      const candleData = data.map(candle => ({
        time: candle[0] / 1000, // Convert ms to seconds
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
      }));

      candlestickSeries.setData(candleData);
    } catch (error) {
      console.error('Error fetching candle data for', symbol, ':', error);
    }
  }, []);

  /**
   * Initialize chart and handle updates
   */
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart with v5 API
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: 'transparent' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: 'rgba(197, 203, 206, 0.1)' },
        horzLines: { color: 'rgba(197, 203, 206, 0.1)' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.2)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.2)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Create candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
      priceFormat: {
        type: 'price',
        precision: 6,
        minMove: 0.000001,
      },
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Fetch initial data
    fetchCandleData(symbol, selectedInterval, candlestickSeries);

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chart) {
        chart.remove();
      }
    };
  }, [symbol, selectedInterval, fetchCandleData]);

  return {
    chartContainerRef,
    selectedInterval,
    setSelectedInterval,
    timeframes,
  };
};
