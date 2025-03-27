import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalPriceData, getHistoricalPriceDataFallback, HistoricalPriceData, TimeFrame } from '@/lib/api/historicalData';
import { getBitcoinPrice, getBitcoinPriceFallback } from '@/lib/api/pricedata_fetch';

// In-memory cache structure for multiple timeframes
type CacheItem = {
  data: HistoricalPriceData;
  timestamp: number;
}

type HistoricalCache = {
  [key in TimeFrame]?: CacheItem;
}

let cache: HistoricalCache = {};
const CACHE_DURATION = 300000; // 5 minutes in milliseconds (300,000ms)

export async function GET(request: NextRequest) {
  try {
    // Get timeframe from query parameters
    const searchParams = request.nextUrl.searchParams;
    const timeFrameParam = searchParams.get('timeframe') as TimeFrame || '60d';
    
    // Validate timeframe parameter
    const validTimeFrames: TimeFrame[] = ['7d', '60d'];
    const timeFrame = validTimeFrames.includes(timeFrameParam) ? timeFrameParam : '60d';
    
    const currentTime = Date.now();
    
    // Return cached data if it's still fresh (less than 5 minutes old)
    if (cache[timeFrame] && currentTime - cache[timeFrame]!.timestamp < CACHE_DURATION) {
      console.log(`Serving historical data (${timeFrame}) from cache`);
      return NextResponse.json(cache[timeFrame]!.data);
    }
    
    // Cache is stale or doesn't exist, fetch new data
    console.log(`Fetching fresh historical data for timeframe: ${timeFrame}`);
    
    try {
      // First get current price for the most recent data point
      const currentPrice = await getBitcoinPrice().catch(() => getBitcoinPriceFallback());
      
      // Then get historical price data
      const historicalData = await getHistoricalPriceData(timeFrame, currentPrice);
      
      // Update cache
      cache[timeFrame] = {
        data: historicalData,
        timestamp: currentTime,
      };
      
      return NextResponse.json(historicalData);
    } catch (error) {
      console.error(`Error fetching historical price data for ${timeFrame}:`, error);
      
      // Try fallback directly if initial fetch failed
      try {
        const currentPrice = await getBitcoinPrice().catch(() => getBitcoinPriceFallback());
        const fallbackData = await getHistoricalPriceDataFallback(timeFrame, currentPrice);
        
        // Update cache with fallback data
        cache[timeFrame] = {
          data: fallbackData,
          timestamp: currentTime,
        };
        
        return NextResponse.json(fallbackData);
      } catch (fallbackError) {
        console.error(`Fallback also failed for ${timeFrame}:`, fallbackError);
        
        // Return stale cache if available, otherwise error
        if (cache[timeFrame]) {
          console.log(`Error occurred, serving stale cache for ${timeFrame}`);
          return NextResponse.json(cache[timeFrame]!.data);
        }
        
        // No cache available, return error
        return NextResponse.json(
          { error: `Failed to fetch historical price data for ${timeFrame}` },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error in historical prices API route:', error);
    return NextResponse.json(
      { error: 'Server error processing historical price data request' },
      { status: 500 }
    );
  }
}