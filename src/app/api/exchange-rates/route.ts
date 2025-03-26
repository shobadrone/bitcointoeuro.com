import { getAllExchangeRates, ExchangeRate } from '@/lib/api/exchangeRates';
import { NextResponse } from 'next/server';

// In-memory cache
type CacheData = {
  rates: ExchangeRate[];
  timestamp: number;
}

let cache: CacheData | null = null;
const CACHE_DURATION = 60000; // 1 minute in milliseconds

export async function GET() {
  try {
    const currentTime = Date.now();
    
    // Return cached data if it's still fresh (less than 1 minute old)
    if (cache && currentTime - cache.timestamp < CACHE_DURATION) {
      console.log('Serving exchange rates from cache');
      return NextResponse.json(cache.rates);
    }
    
    // Cache is stale or doesn't exist, fetch new data
    console.log('Fetching fresh exchange rates from APIs');
    const rates = await getAllExchangeRates();
    
    // Update cache
    cache = {
      rates,
      timestamp: currentTime,
    };
    
    return NextResponse.json(rates);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return stale cache if available, otherwise error
    if (cache) {
      console.log('Error occurred, serving stale cache');
      return NextResponse.json(cache.rates);
    }
    
    // No cache available, return error
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates' },
      { status: 500 }
    );
  }
}