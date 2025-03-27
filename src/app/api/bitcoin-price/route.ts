import { NextResponse } from 'next/server';
import { getBitcoinPrice, getBitcoinPriceFallback, BitcoinPriceData } from '@/lib/api/pricedata_fetch';

// In-memory cache
type CacheData = {
  price: BitcoinPriceData;
  timestamp: number;
}

// Use a more persistent cache approach
let cache: CacheData | null = null;
const CACHE_DURATION = 30000; // 30 seconds in milliseconds

export async function GET() {
  try {
    const currentTime = Date.now();
    
    // Return cached data if it's still fresh
    if (cache && currentTime - cache.timestamp < CACHE_DURATION) {
      console.log('Serving Bitcoin price from cache');
      
      // Add cache control headers to help browsers cache the response
      return NextResponse.json(cache.price, {
        headers: {
          'Cache-Control': `public, max-age=${Math.floor(CACHE_DURATION / 1000)}`,
          'Expires': new Date(currentTime + CACHE_DURATION).toUTCString()
        }
      });
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
      
      // Add cache headers to successful response too
      return NextResponse.json(price, {
        headers: {
          'Cache-Control': `public, max-age=${Math.floor(CACHE_DURATION / 1000)}`,
          'Expires': new Date(currentTime + CACHE_DURATION).toUTCString()
        }
      });
    } catch (error) {
      console.error('Primary API failed, trying fallback:', error);
      
      // If CoinGecko fails, try LiveCoinWatch
      const fallbackPrice = await getBitcoinPriceFallback();
      
      // Update cache with fallback data
      cache = {
        price: fallbackPrice,
        timestamp: currentTime,
      };
      
      // Add cache headers to fallback response too
      return NextResponse.json(fallbackPrice, {
        headers: {
          'Cache-Control': `public, max-age=${Math.floor(CACHE_DURATION / 1000)}`,
          'Expires': new Date(currentTime + CACHE_DURATION).toUTCString()
        }
      });
    }
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    
    // Return stale cache if available, otherwise error
    if (cache) {
      console.log('Error occurred, serving stale cache');
      // Return stale cache with cache headers
      return NextResponse.json(cache.price, {
        headers: {
          'Cache-Control': `public, max-age=${Math.floor(CACHE_DURATION / 2000)}`, // Half the normal duration for stale cache
          'Expires': new Date(currentTime + (CACHE_DURATION / 2)).toUTCString()
        }
      });
    }
    
    // No cache available, return error
    return NextResponse.json(
      { error: 'Failed to fetch Bitcoin price' },
      { status: 500 }
    );
  }
}