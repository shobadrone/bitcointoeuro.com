import { NextResponse } from 'next/server';
import { getBitcoinPrice, getBitcoinPriceFallback, BitcoinPriceData } from '@/lib/api/pricedata_fetch';

// In-memory cache
type CacheData = {
  price: BitcoinPriceData;
  timestamp: number;
}

let cache: CacheData | null = null;
const CACHE_DURATION = 5000; // 5 seconds in milliseconds

export async function GET() {
  try {
    const currentTime = Date.now();
    
    // Return cached data if it's still fresh (less than 5 seconds old)
    if (cache && currentTime - cache.timestamp < CACHE_DURATION) {
      console.log('Serving Bitcoin price from cache');
      return NextResponse.json(cache.price);
    }
    
    // Cache is stale or doesn't exist, fetch new data
    console.log('Fetching fresh Bitcoin price from API');
    
    try {
      // First try CoinGecko
      const price = await getBitcoinPrice();
      
      // Update cache
      cache = {
        price,
        timestamp: currentTime,
      };
      
      return NextResponse.json(price);
    } catch (error) {
      console.error('Primary API failed, trying fallback:', error);
      
      // If CoinGecko fails, try LiveCoinWatch
      const fallbackPrice = await getBitcoinPriceFallback();
      
      // Update cache with fallback data
      cache = {
        price: fallbackPrice,
        timestamp: currentTime,
      };
      
      return NextResponse.json(fallbackPrice);
    }
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    
    // Return stale cache if available, otherwise error
    if (cache) {
      console.log('Error occurred, serving stale cache');
      return NextResponse.json(cache.price);
    }
    
    // No cache available, return error
    return NextResponse.json(
      { error: 'Failed to fetch Bitcoin price' },
      { status: 500 }
    );
  }
}