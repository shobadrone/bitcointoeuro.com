import useSWR from 'swr';
import { ExchangeRate } from './exchangeRates';
import axios from 'axios';

// Create a fetcher function that calls our server API instead of external APIs directly
const fetcher = async (): Promise<ExchangeRate[]> => {
  try {
    const response = await axios.get('/api/exchange-rates');
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange rates from API:', error);
    throw error;
  }
};

export default function useExchangeRates(refreshInterval = 60000) { // Default refresh every minute matching server cache
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    'exchange-rates',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: false, // Don't revalidate on focus to reduce API calls
      dedupingInterval: 45000, // Deduplicate requests within 45 seconds
      focusThrottleInterval: 60000, // Throttle focus revalidation
      errorRetryCount: 3, // Only retry 3 times on error
      revalidateIfStale: false, // Don't automatically revalidate stale data
      
      // Persist cache in localStorage to maintain data between page loads
      provider: () => {
        // Define storage provider to persist cache in localStorage
        const map = new Map(
          JSON.parse(localStorage.getItem('exchange-rates-cache') || '[]')
        );
        
        // Before unloading the page, save the cache to localStorage
        window.addEventListener('beforeunload', () => {
          const appCache = JSON.stringify(Array.from(map.entries()));
          localStorage.setItem('exchange-rates-cache', appCache);
        });
        
        return map;
      }
    }
  );

  return {
    rates: data,
    isLoading,
    isError: !!error,
    isValidating,
    mutate
  };
}