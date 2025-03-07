import axios from 'axios';
import { getHistoricalPriceData, getHistoricalPriceDataFallback, TimeFrame } from './historicalData';

/**
 * Test script to verify if the LiveCoinWatch fallback mechanism is working correctly
 * This can be run directly to test the fallback without going through the React components
 */

// Mock function to force a failure from CoinGecko
async function forceCoinGeckoFailure(timeFrame: TimeFrame) {
  try {
    // Create a deliberately failing request to CoinGecko
    console.log(`Testing timeframe: ${timeFrame} - Forcing CoinGecko failure`);
    
    // This will cause a 401 error (invalid API key)
    await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'eur',
        api_key: 'invalid_api_key'
      }
    });
    
    // We should never reach here
    return { success: true, data: null };
  } catch (error: any) {
    // Verify we got the expected 401 error
    console.log(`✓ CoinGecko failure successfully triggered: ${error.response?.status} ${error.message}`);
    
    // Now test the fallback
    try {
      console.log(`Testing LiveCoinWatch fallback for timeframe: ${timeFrame}...`);
      const fallbackData = await getHistoricalPriceDataFallback(timeFrame);
      
      // Check if we got valid data
      if (fallbackData && fallbackData.data && fallbackData.data.length > 0) {
        console.log(`✓ Fallback SUCCESS - Got ${fallbackData.data.length} data points`);
        console.log(`  First point: ${new Date(fallbackData.data[0].timestamp).toISOString()}`);
        console.log(`  Last point: ${new Date(fallbackData.data[fallbackData.data.length-1].timestamp).toISOString()}`);
        console.log(`  Change percentage: ${fallbackData.changePercentage.toFixed(2)}%`);
        return { success: true, data: fallbackData };
      } else {
        console.log(`✗ Fallback FAILED - No data returned`);
        return { success: false, data: null };
      }
    } catch (fallbackError: any) {
      console.error(`✗ Fallback FAILED with error: ${fallbackError.message}`);
      return { success: false, error: fallbackError };
    }
  }
}

// Test the LiveCoinWatch API directly
async function testDirectFallback(timeFrame: TimeFrame) {
  try {
    console.log(`\nDirect test of LiveCoinWatch fallback for timeframe: ${timeFrame}...`);
    const fallbackData = await getHistoricalPriceDataFallback(timeFrame);
    
    if (fallbackData && fallbackData.data && fallbackData.data.length > 0) {
      console.log(`✓ Direct fallback SUCCESS - Got ${fallbackData.data.length} data points`);
      console.log(`  First point: ${new Date(fallbackData.data[0].timestamp).toISOString()}`);
      console.log(`  Last point: ${new Date(fallbackData.data[fallbackData.data.length-1].timestamp).toISOString()}`);
      return { success: true, data: fallbackData };
    } else {
      console.log(`✗ Direct fallback FAILED - No data returned`);
      return { success: false, data: null };
    }
  } catch (error: any) {
    console.error(`✗ Direct fallback FAILED with error: ${error.message}`);
    return { success: false, error };
  }
}

// Test the full flow including error handling in getHistoricalPriceData
async function testFullErrorHandling(timeFrame: TimeFrame) {
  try {
    // Monkey patch axios to force an error for CoinGecko
    const originalGet = axios.get;
    const originalPost = axios.post;
    
    // Override GET for CoinGecko
    axios.get = async (url: string, config?: any) => {
      if (url.includes('coingecko')) {
        throw new Error('Forced CoinGecko failure');
      }
      return originalGet(url, config);
    };
    
    console.log(`\nTesting full error handling flow for timeframe: ${timeFrame}...`);
    const data = await getHistoricalPriceData(timeFrame);
    
    // Restore original axios methods
    axios.get = originalGet;
    
    if (data && data.data && data.data.length > 0) {
      console.log(`✓ Full flow SUCCESS - Got ${data.data.length} data points`);
      console.log(`  First point: ${new Date(data.data[0].timestamp).toISOString()}`);
      console.log(`  Last point: ${new Date(data.data[data.data.length-1].timestamp).toISOString()}`);
      return { success: true, data };
    } else {
      console.log(`✗ Full flow FAILED - No data returned`);
      return { success: false, data: null };
    }
  } catch (error: any) {
    console.error(`✗ Full flow FAILED with error: ${error.message}`);
    return { success: false, error };
  }
}

// Run tests for each timeframe
async function runTests() {
  const timeFrames: TimeFrame[] = ['7d', '60d', '1y', '5y'];
  
  console.log('=== FALLBACK MECHANISM TEST ===\n');
  
  for (const timeFrame of timeFrames) {
    console.log(`\n--- Testing timeframe: ${timeFrame} ---`);
    
    // Test 1: Force CoinGecko failure and test fallback
    await forceCoinGeckoFailure(timeFrame);
    
    // Test 2: Directly test Bitfinex fallback
    await testDirectFallback(timeFrame);
    
    // Test 3: Test the full error handling flow
    await testFullErrorHandling(timeFrame);
    
    console.log(`\n--- Completed tests for timeframe: ${timeFrame} ---`);
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

// Export for direct browser testing
export { runTests, forceCoinGeckoFailure, testDirectFallback, testFullErrorHandling };

// Automatically run if directly executed (via Node.js)
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}