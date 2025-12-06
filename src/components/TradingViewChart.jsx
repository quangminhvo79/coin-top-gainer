import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';

function TradingViewChart({ symbol, interval }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const [selectedInterval, setSelectedInterval] = useState(interval || '15m');

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

    // Create candlestick series with v5 API
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

    // Fetch candle data
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
  }, [symbol, selectedInterval]);

  const fetchCandleData = async (symbol, interval, candlestickSeries) => {
    try {
      // Remove USDT suffix if present
      // const baseSymbol = symbol.replace('USDT', '');

      // Fetch klines data from Binance Futures API
      // interval: 15m (15 minutes), limit: 100 candles
      const response = await fetch(
        `https://fapi.binance.com/fapi/v1/continuousKlines?pair=${symbol}&interval=${interval}&contractType=PERPETUAL&limit=100`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check if data is valid
      if (!Array.isArray(data) || data.length === 0) {
        console.error('Invalid data format from Binance API');
        return;
      }

      // Transform Binance kline data to TradingView format
      // Binance format: [openTime, open, high, low, close, volume, closeTime, ...]
      const candleData = data.map(candle => ({
        time: candle[0] / 1000, // Convert ms to seconds (index 0: Open time)
        open: parseFloat(candle[1]), // index 1: Open
        high: parseFloat(candle[2]), // index 2: High
        low: parseFloat(candle[3]),  // index 3: Low
        close: parseFloat(candle[4]), // index 4: Close
      }));

      candlestickSeries.setData(candleData);
    } catch (error) {
      console.error('Error fetching candle data for', symbol, ':', error);
    }
  };

  return (
    <div className="w-full rounded-lg overflow-hidden glass p-2">
      {/* Timeframe Selector */}
      <div className="flex gap-1 mb-2 flex-wrap">
        {timeframes.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setSelectedInterval(tf.value)}
            className={`px-3 py-1 text-xs font-semibold rounded transition-all duration-200 ${
              selectedInterval === tf.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div ref={chartContainerRef} className="w-full h-[300px]" />
    </div>
  );
}

export default TradingViewChart;
