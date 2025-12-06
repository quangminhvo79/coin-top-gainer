/**
 * Detect if the user is on a mobile device
 */
export const isMobileDevice = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

/**
 * Open trading platform (Binance) for a given symbol
 * Handles both mobile and desktop cases
 */
export const openTradingPlatform = (symbol) => {
  const baseSymbol = symbol.replace('USDT', '');

  if (isMobileDevice()) {
    // For mobile: Try to open Binance app, fallback to mobile web
    const appUrl = `binance://markets/futures/${baseSymbol}_USDT`;
    const fallbackUrl = `https://www.binance.com/en/futures/${baseSymbol}_USDT`;

    window.location.href = appUrl;

    // Fallback to web if app doesn't open
    setTimeout(() => {
      window.location.href = fallbackUrl;
    }, 2000);
  } else {
    // For desktop: Open Binance website in new tab
    const webUrl = `https://www.binance.com/en/futures/${baseSymbol}_USDT`;
    window.open(webUrl, '_blank', 'noopener,noreferrer');
  }
};
