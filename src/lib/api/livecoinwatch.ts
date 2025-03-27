import axios from 'axios';
import { BitcoinPriceData } from './pricedata_fetch';
import { HistoricalPricePoint, TimeFrame } from './historicalData';

// Store API key as a constant - this will be replaced with environment variable
// IMPORTANT: Do not commit API keys to public repositories
const LCW_API_KEY = process.env.NEXT_PUBLIC_LCW_API_KEY || '';

const LCW_API_URL = 'https://api.livecoinwatch.com';

// Get current Bitcoin price from LiveCoinWatch
export async function getLiveCoinWatchPrice(): Promise<BitcoinPriceData> {
  try {
    const response = await axios.post(
      `${LCW_API_URL}/coins/single`,
      {
        currency: 'EUR',
        code: 'BTC',
        meta: true,
      },
      {
        headers: {
          'content-type': 'application/json',
          'x-api-key': LCW_API_KEY,
        },
      }
    );

    // Log response structure for debugging
    console.log('LiveCoinWatch single coin response:', 
                Object.keys(response.data),
                response.data.rate ? 'has rate' : 'no rate');
                
    if (!response.data || !response.data.rate) {
      throw new Error('Invalid response from LiveCoinWatch API');
    }

    // Extract price and calculate 24h change
    const currentPrice = response.data.rate;
    const price24hAgo = currentPrice / (1 + response.data.delta.day / 100);
    const changePercentage = response.data.delta.day;

    return {
      eur: currentPrice,
      eur_24h_change: changePercentage,
      last_updated_at: Math.floor(Date.now() / 1000),
    };
  } catch (error) {
    console.error('Error fetching Bitcoin price from LiveCoinWatch:', error);
    throw error;
  }
}

// Get historical price data from LiveCoinWatch
// Since LiveCoinWatch free API doesn't have a direct historical endpoint,
// we'll use the coin/single endpoint and the delta values to create approximated historical data
export async function getLiveCoinWatchHistorical(
  timeFrame: TimeFrame
): Promise<HistoricalPricePoint[]> {
  try {
    // Get the current price with delta information
    const currentPriceResponse = await axios.post(
      `${LCW_API_URL}/coins/single`,
      {
        currency: 'EUR',
        code: 'BTC',
        meta: true,
      },
      {
        headers: {
          'content-type': 'application/json',
          'x-api-key': LCW_API_KEY,
        },
      }
    );

    // Log response structure for debugging
    console.log('LiveCoinWatch delta values:', 
                currentPriceResponse.data.delta ? 
                Object.keys(currentPriceResponse.data.delta) : 'no delta');
    
    if (!currentPriceResponse.data || !currentPriceResponse.data.rate || !currentPriceResponse.data.delta) {
      throw new Error('Invalid response from LiveCoinWatch API');
    }

    // Current price and percentage changes
    const currentPrice = currentPriceResponse.data.rate;
    const dayChange = currentPriceResponse.data.delta.day;
    const weekChange = currentPriceResponse.data.delta.week;
    const monthChange = currentPriceResponse.data.delta.month;
    const quarterChange = currentPriceResponse.data.delta.quarter;
    const yearChange = currentPriceResponse.data.delta.year;

    // Calculate historical prices based on deltas
    const now = Date.now();
    const historyData: HistoricalPricePoint[] = [];
    
    // We'll create a smooth curve that matches the key delta points
    // Start with the current price point
    historyData.push({
      timestamp: now,
      price: currentPrice
    });

    let dataPoints: number;
    let pricePoints: { timestamp: number, price: number }[] = [];
    
    switch (timeFrame) {
      case '7d': {
        // 7 days with daily points - create 7 points using the week delta
        dataPoints = 7;
        // Calculate the price 7 days ago
        const sevenDaysAgoPrice = currentPrice / weekChange;
        
        // Add key price point
        pricePoints = [
          { timestamp: now - 7 * 24 * 60 * 60 * 1000, price: sevenDaysAgoPrice }
        ];
        break;
      }
      case '60d': {
        // 60 days with daily points - use month and quarter deltas
        dataPoints = 60;
        
        // Calculate key prices
        const thirtyDaysAgoPrice = currentPrice / monthChange;
        const sixtyDaysAgoPrice = currentPrice / (monthChange * 1.1); // Approximation
        
        // Add key price points
        pricePoints = [
          { timestamp: now - 30 * 24 * 60 * 60 * 1000, price: thirtyDaysAgoPrice },
          { timestamp: now - 60 * 24 * 60 * 60 * 1000, price: sixtyDaysAgoPrice }
        ];
        break;
      }
      default:
        dataPoints = 60;
        break;
    }
    
    // Add starting price point
    historyData.unshift(...pricePoints);
    
    // Now interpolate to create a full dataset
    const result = interpolateHistoricalPrices(historyData, dataPoints, timeFrame);
    
    // Return data sorted by timestamp (oldest first)
    return result.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error generating historical price data:', error);
    throw error;
  }
}

// Enhanced interpolation with volatility simulation to create a more realistic dataset
function interpolateHistoricalPrices(
  keyPoints: HistoricalPricePoint[],
  targetLength: number,
  timeFrame: TimeFrame
): HistoricalPricePoint[] {
  if (keyPoints.length <= 1) return keyPoints;
  
  // Sort key points by timestamp (newest first)
  const sortedPoints = [...keyPoints].sort((a, b) => b.timestamp - a.timestamp);
  
  // Create result array with the full dataset
  const result: HistoricalPricePoint[] = [];
  const now = sortedPoints[0].timestamp;
  
  // Calculate time step based on timeframe - match CoinGecko's density
  let timeStep: number;
  
  switch (timeFrame) {
    case '7d':
      timeStep = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '60d':
      timeStep = 24 * 60 * 60 * 1000; // 1 day
      break;
    default:
      timeStep = 24 * 60 * 60 * 1000; // 1 day
  }
  
  // Generate all timestamps based on target length
  const timestamps: number[] = [];
  for (let i = 0; i < targetLength; i++) {
    // Calculate time step based on total range and target length for even distribution
    const totalTimeRange = now - sortedPoints[sortedPoints.length - 1].timestamp;
    const evenTimeStep = totalTimeRange / (targetLength - 1);
    timestamps.push(now - i * evenTimeStep);
  }
  
  // Set up volatility parameters based on timeframe
  let baseVolatility: number;
  let volatilityIncrement: number;
  
  switch (timeFrame) {
    case '7d':
      baseVolatility = 0.005; // 0.5% base volatility for 7d
      volatilityIncrement = 0.001; // Small randomness
      break;
    case '60d':
      baseVolatility = 0.01; // 1% base volatility for 60d
      volatilityIncrement = 0.002; // More variation
      break;
    default:
      baseVolatility = 0.005;
      volatilityIncrement = 0.001;
  }
  
  // Add price trend memory to create more realistic volatility patterns
  let lastTrend = 0; // -1: downtrend, 0: neutral, 1: uptrend
  let trendStrength = 0; // 0-1 indicating strength of current trend
  
  // For each timestamp, find or interpolate price
  timestamps.forEach(timestamp => {
    // Check if this is a key point we already have
    const exactPoint = sortedPoints.find(p => p.timestamp === timestamp);
    if (exactPoint) {
      result.push(exactPoint);
      return;
    }
    
    // Find the two closest key points for interpolation
    let beforePoint: HistoricalPricePoint | null = null;
    let afterPoint: HistoricalPricePoint | null = null;
    
    for (let i = 0; i < sortedPoints.length; i++) {
      if (sortedPoints[i].timestamp <= timestamp) {
        beforePoint = sortedPoints[i];
        break;
      }
    }
    
    for (let i = sortedPoints.length - 1; i >= 0; i--) {
      if (sortedPoints[i].timestamp >= timestamp) {
        afterPoint = sortedPoints[i];
        break;
      }
    }
    
    // Calculate interpolated price
    let price: number;
    
    if (!beforePoint && afterPoint) {
      // Extrapolate before first point
      price = afterPoint.price;
    } else if (beforePoint && !afterPoint) {
      // Extrapolate after last point
      price = beforePoint.price;
    } else if (beforePoint && afterPoint) {
      // Interpolate between points
      const timeRange = afterPoint.timestamp - beforePoint.timestamp;
      const priceRange = afterPoint.price - beforePoint.price;
      
      if (timeRange === 0) {
        price = beforePoint.price;
      } else {
        const ratio = (timestamp - beforePoint.timestamp) / timeRange;
        
        // Apply some mild non-linearity to avoid perfectly straight lines
        const adjustedRatio = Math.pow(ratio, 1.1);
        
        // Base interpolated price
        price = beforePoint.price + adjustedRatio * priceRange;
        
        // Determine underlying trend direction
        const trendDirection = priceRange > 0 ? 1 : priceRange < 0 ? -1 : 0;
        
        // Update trend with some persistence
        if (trendDirection !== lastTrend) {
          // Reset trend strength on direction change
          trendStrength = 0.2; 
          lastTrend = trendDirection;
        } else {
          // Increase trend strength with persistence (max 0.8)
          trendStrength = Math.min(trendStrength + 0.1, 0.8);
        }
        
        // Calculate effective volatility (higher during trend changes, lower during persistent trends)
        const effectiveVolatility = baseVolatility * (1 + (1 - trendStrength));
        
        // Add market-like variations - influenced by current trend
        const volatilityBias = lastTrend * 0.3; // Bias volatility in trend direction
        const randomVariation = (Math.random() * 2 - 1 + volatilityBias) * effectiveVolatility;
        
        // Apply random variation
        price *= (1 + randomVariation);
        
        // Add chance of small price spikes (common in crypto)
        if (Math.random() < 0.03) { // 3% chance of spike
          const spikeDirection = (Math.random() > 0.5) ? 1 : -1;
          const spikeMagnitude = baseVolatility * 5; // 5x normal volatility
          price *= (1 + spikeDirection * spikeMagnitude);
        }
      }
    } else {
      // Fallback
      price = sortedPoints[0].price;
    }
    
    result.push({
      timestamp,
      price
    });
  });
  
  return result;
}

// Helper function to sample data points evenly
function sampleDataPoints(data: HistoricalPricePoint[], targetCount: number): HistoricalPricePoint[] {
  if (data.length <= targetCount) return data;

  const result: HistoricalPricePoint[] = [];
  const interval = data.length / targetCount;

  for (let i = 0; i < targetCount; i++) {
    const index = Math.min(Math.floor(i * interval), data.length - 1);
    result.push(data[index]);
  }

  return result;
}