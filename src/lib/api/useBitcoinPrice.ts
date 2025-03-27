import useSWR from 'swr';
import { BitcoinPriceData } from './pricedata_fetch';
import axios from 'axios';

// Create a fetcher function that calls our server API
const fetcher = async (): Promise<BitcoinPriceData> => {
  try {
    const response = await axios.get('/api/bitcoin-price');
    return response.data;
  } catch (error) {
    console.error('Error fetching Bitcoin price from API:', error);
    throw error;
  }
};

export default function useBitcoinPrice(refreshInterval = 30000) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    'bitcoin-price',
    fetcher,
    {
      refreshInterval, // Refresh every 30 seconds by default to match server cache
      revalidateOnFocus: false, // Don't revalidate on focus to reduce API calls
      dedupingInterval: 15000, // Deduplicate requests within 15 seconds
      focusThrottleInterval: 30000, // Throttle focus revalidation
      errorRetryCount: 3, // Only retry 3 times on error
      revalidateIfStale: false, // Don't automatically revalidate stale data
      
      // Persist cache in localStorage to maintain price data between page loads
      provider: () => {
        // Define storage provider to persist cache in localStorage
        const map = new Map(
          JSON.parse(localStorage.getItem('bitcoin-price-cache') || '[]')
        );
        
        // Before unloading the page, save the cache to localStorage
        window.addEventListener('beforeunload', () => {
          const appCache = JSON.stringify(Array.from(map.entries()));
          localStorage.setItem('bitcoin-price-cache', appCache);
        });
        
        return map;
      }
    }
  );

  return {
    price: data,
    isLoading,
    isError: !!error,
    isValidating,
    mutate
  };
}