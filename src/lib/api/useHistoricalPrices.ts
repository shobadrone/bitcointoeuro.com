import useSWR from 'swr';
import axios from 'axios';
import { getHistoricalPriceData, TimeFrame, HistoricalPriceData } from './historicalData';
import useBitcoinPrice from './useBitcoinPrice';

// Direct fetcher for CoinGecko (used in production) 
const directFetcher = (currentPrice: any, timeFrameParam: TimeFrame) => {
  return async (): Promise<HistoricalPriceData> => {
    // Pass the specific timeframe to ensure we get the right data
    return await getHistoricalPriceData(timeFrameParam, currentPrice);
  };
};

// API endpoint fetcher (new approach with server-side caching)
const apiFetcher = async (timeFrame: TimeFrame): Promise<HistoricalPriceData> => {
  try {
    const response = await axios.get(`/api/historical-prices?timeframe=${timeFrame}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching historical price data from API:', error);
    throw error;
  }
};

export default function useHistoricalPrices(timeFrame: TimeFrame = '60d') {
  // Get current price data to use for the most recent point
  const { price: currentPrice } = useBitcoinPrice();
  
  // For 60-day timeframe, use the direct approach to ensure data consistency with production
  const useDirect = timeFrame === '60d';
  
  // Fetch historical data from our API with caching
  // Use timeFrame in the key to ensure different caching per timeframe
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    `historical-prices-${timeFrame}`,
    useDirect 
      ? directFetcher(currentPrice, timeFrame)
      : () => apiFetcher(timeFrame),
    {
      refreshInterval: 3600000, // Refresh every hour (much less frequent than current price)
      revalidateOnFocus: false, // Don't revalidate on focus for historical data
      dedupingInterval: 300000, // 5 minutes deduplication time for switching timeframes
      focusThrottleInterval: 3600000, // Throttle focus revalidation to once per hour
      
      // Local storage cache provider to persist data between sessions
      provider: () => {
        // Define storage provider to persist cache in localStorage
        const map = new Map(
          JSON.parse(localStorage.getItem('historical-price-cache') || '[]')
        );
        
        // Before unloading the page, save the cache to localStorage
        window.addEventListener('beforeunload', () => {
          const appCache = JSON.stringify(Array.from(map.entries()));
          localStorage.setItem('historical-price-cache', appCache);
        });
        
        return map;
      }
    }
  );

  return {
    historicalData: data,
    isLoading,
    isError: !!error,
    isValidating,
    mutate
  };
}