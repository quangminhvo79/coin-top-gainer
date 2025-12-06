/**
 * Format price with appropriate decimal places
 */
export const formatPrice = (price) => {
  if (price >= 1) {
    return `$${price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
};

/**
 * Format volume with K, M, B suffixes
 */
export const formatVolume = (vol) => {
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
  if (vol >= 1e3) return `$${(vol / 1e3).toFixed(2)}K`;
  return `$${vol.toFixed(2)}`;
};

/**
 * Get rank color gradient classes
 */
export const getRankColor = (rank) => {
  if (rank === 1) return 'from-[#00d4ff] to-[#00ff88]';
  if (rank === 2) return 'from-[#b794f6] to-[#00d4ff]';
  if (rank === 3) return 'from-[#ff6b35] to-[#ff0080]';
  return 'from-[#b794f6] to-[#00d4ff]';
};

/**
 * Get rank glow shadow
 */
export const getRankGlow = (rank) => {
  if (rank === 1) return '0 0 20px rgba(0, 212, 255, 0.6), 0 0 40px rgba(0, 255, 136, 0.4)';
  if (rank === 2) return '0 0 20px rgba(183, 148, 246, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)';
  if (rank === 3) return '0 0 20px rgba(255, 107, 53, 0.5), 0 0 40px rgba(255, 0, 128, 0.3)';
  return '0 0 15px rgba(183, 148, 246, 0.4)';
};

/**
 * Generate sparkline data for visualization
 */
export const generateSparklineData = (low, high, current) => {
  const points = 20;
  const data = [];
  const range = high - low;

  for (let i = 0; i < points; i++) {
    const variance = Math.random() * 0.6 + 0.2;
    const trend = (i / points) * 0.7 + 0.15;
    const value = low + (range * variance * trend);
    data.push(value);
  }

  data[points - 1] = current;
  return data;
};
