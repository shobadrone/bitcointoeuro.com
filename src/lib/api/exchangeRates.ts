import axios from 'axios';

export interface ExchangeRate {
  exchangeName: string;
  price: number;
  fees: string; // Fee information (added manually)
  lastUpdated: number;
  exchangeUrl: string; // URL to the exchange website
}

// Function to fetch BTC/EUR rate from Bybit
export async function getBybitRate(): Promise<ExchangeRate> {
  try {
    const response = await axios.get(
      'https://api.bybit.com/v5/market/tickers?category=spot&symbol=BTCEUR'
    );
    
    if (!response.data || !response.data.result || !response.data.result.list || !response.data.result.list[0]) {
      throw new Error('Invalid response from Bybit API');
    }
    
    const data = response.data.result.list[0];
    
    return {
      exchangeName: 'Bybit',
      price: parseFloat(data.lastPrice),
      fees: '0.1%', // Manual fee information
      lastUpdated: Date.now(),
      exchangeUrl: 'https://partner.bybit.com/b/120149'
    };
  } catch (error) {
    console.error('Error fetching Bybit price:', error);
    throw error;
  }
}

// Function to fetch BTC/EUR rate from Kraken
export async function getKrakenRate(): Promise<ExchangeRate> {
  try {
    const response = await axios.get(
      'https://api.kraken.com/0/public/Ticker?pair=XXBTZEUR'
    );
    
    if (!response.data || !response.data.result || !response.data.result.XXBTZEUR) {
      throw new Error('Invalid response from Kraken API');
    }
    
    const data = response.data.result.XXBTZEUR;
    
    return {
      exchangeName: 'Kraken',
      price: parseFloat(data.c[0]), // Current price is in the 'c' array
      fees: '0.16%', // Manual fee information
      lastUpdated: Date.now(),
      exchangeUrl: 'https://www.kraken.com'
    };
  } catch (error) {
    console.error('Error fetching Kraken price:', error);
    throw error;
  }
}

// Function to fetch BTC/EUR rate from Coinbase
export async function getCoinbaseRate(): Promise<ExchangeRate> {
  try {
    const response = await axios.get(
      'https://api.exchange.coinbase.com/products/BTC-EUR/ticker'
    );
    
    if (!response.data || !response.data.price) {
      throw new Error('Invalid response from Coinbase API');
    }
    
    return {
      exchangeName: 'Coinbase',
      price: parseFloat(response.data.price),
      fees: '0.4-0.6%', // Manual fee information
      lastUpdated: Date.now(),
      exchangeUrl: 'https://www.coinbase.com'
    };
  } catch (error) {
    console.error('Error fetching Coinbase price:', error);
    throw error;
  }
}

// Function to fetch BTC/EUR rate from Binance
export async function getBinanceRate(): Promise<ExchangeRate> {
  try {
    const response = await axios.get(
      'https://api.binance.com/api/v3/ticker/price?symbol=BTCEUR'
    );
    
    if (!response.data || !response.data.price) {
      throw new Error('Invalid response from Binance API');
    }
    
    return {
      exchangeName: 'Binance',
      price: parseFloat(response.data.price),
      fees: '0.1%', // Manual fee information
      lastUpdated: Date.now(),
      exchangeUrl: 'https://www.binance.com'
    };
  } catch (error) {
    console.error('Error fetching Binance price:', error);
    throw error;
  }
}

// Function to fetch BTC/EUR rate from Bitvavo
export async function getBitvavoRate(): Promise<ExchangeRate> {
  try {
    const response = await axios.get(
      'https://api.bitvavo.com/v2/ticker/price?market=BTC-EUR'
    );
    
    if (!response.data || !response.data.price) {
      throw new Error('Invalid response from Bitvavo API');
    }
    
    return {
      exchangeName: 'Bitvavo',
      price: parseFloat(response.data.price),
      fees: '0.15-0.25%', // Manual fee information
      lastUpdated: Date.now(),
      exchangeUrl: 'https://www.bitvavo.com'
    };
  } catch (error) {
    console.error('Error fetching Bitvavo price:', error);
    throw error;
  }
}

// Function to fetch BTC/EUR rate from Gate.io
export async function getGateIoRate(): Promise<ExchangeRate> {
  try {
    const response = await axios.get(
      'https://api.gateio.ws/api/v4/spot/tickers?currency_pair=BTC_EUR'
    );
    
    if (!response.data || response.data.length === 0 || !response.data[0].last) {
      throw new Error('Invalid response from Gate.io API');
    }
    
    return {
      exchangeName: 'Gate.io',
      price: parseFloat(response.data[0].last),
      fees: '0.2%', // Manual fee information
      lastUpdated: Date.now(),
      exchangeUrl: 'https://www.gate.io'
    };
  } catch (error) {
    console.error('Error fetching Gate.io price:', error);
    throw error;
  }
}

// Function to fetch all exchange rates
export async function getAllExchangeRates(): Promise<ExchangeRate[]> {
  try {
    // Execute all API calls in parallel for better performance
    const results = await Promise.allSettled([
      getBybitRate(),
      getKrakenRate(),
      getCoinbaseRate(),
      getBinanceRate(),
      getBitvavoRate(),
      getGateIoRate()
    ]);
    
    // Filter out rejected promises and extract values from fulfilled ones
    const rates: ExchangeRate[] = results
      .filter((result): result is PromiseFulfilledResult<ExchangeRate> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
    
    // If we got at least one rate, return the result
    if (rates.length > 0) {
      return rates;
    }
    
    throw new Error('Failed to fetch rates from all exchanges');
  } catch (error) {
    console.error('Error fetching all exchange rates:', error);
    throw error;
  }
}