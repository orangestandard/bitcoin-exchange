import axios from 'axios';
import prisma from '../utils/database';
import logger from '../utils/logger';

export interface PriceData {
  priceUsd: number;
  source: string;
  timestamp: Date;
}

export interface MarketData {
  priceUsd: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  source: string;
  timestamp: Date;
}

class PriceService {
  private currentPrice: number = 0;
  private lastUpdate: Date = new Date();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startPriceUpdates();
  }

  // Start automatic price updates
  startPriceUpdates() {
    // Update price every 30 seconds
    this.updateInterval = setInterval(() => {
      this.updateCurrentPrice();
    }, 30000);

    // Initial price fetch
    this.updateCurrentPrice();
  }

  // Stop automatic price updates
  stopPriceUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Get current price from cache
  getCurrentPrice(): PriceData {
    return {
      priceUsd: this.currentPrice,
      source: 'cache',
      timestamp: this.lastUpdate,
    };
  }

  // Fetch price from Coinbase API
  async fetchCoinbasePrice(): Promise<number> {
    try {
      const response = await axios.get(
        'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
        { timeout: 10000 }
      );

      const price = parseFloat(response.data.data.rates.USD);
      logger.debug('Fetched Coinbase price:', { price });
      return price;
    } catch (error) {
      logger.error('Error fetching Coinbase price:', error);
      throw error;
    }
  }

  // Fetch price from CoinGecko API (backup)
  async fetchCoinGeckoPrice(): Promise<number> {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        { timeout: 10000 }
      );

      const price = response.data.bitcoin.usd;
      logger.debug('Fetched CoinGecko price:', { price });
      return price;
    } catch (error) {
      logger.error('Error fetching CoinGecko price:', error);
      throw error;
    }
  }

  // Fetch comprehensive market data from CoinGecko
  async fetchMarketData(): Promise<MarketData> {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/bitcoin',
        { timeout: 15000 }
      );

      const data = response.data;
      const marketData: MarketData = {
        priceUsd: data.market_data.current_price.usd,
        change24h: data.market_data.price_change_percentage_24h || 0,
        volume24h: data.market_data.total_volume.usd || 0,
        marketCap: data.market_data.market_cap.usd || 0,
        source: 'coingecko',
        timestamp: new Date(),
      };

      logger.debug('Fetched market data:', marketData);
      return marketData;
    } catch (error) {
      logger.error('Error fetching market data:', error);
      throw error;
    }
  }

  // Update current price with fallback
  async updateCurrentPrice(): Promise<PriceData> {
    try {
      let price: number;
      let source: string;

      try {
        // Try Coinbase first
        price = await this.fetchCoinbasePrice();
        source = 'coinbase';
      } catch (error) {
        // Fallback to CoinGecko
        logger.warn('Coinbase failed, trying CoinGecko...');
        price = await this.fetchCoinGeckoPrice();
        source = 'coingecko';
      }

      this.currentPrice = price;
      this.lastUpdate = new Date();

      // Save to database
      await this.savePriceToDatabase(price, source);

      const priceData: PriceData = {
        priceUsd: price,
        source,
        timestamp: this.lastUpdate,
      };

      logger.info('Price updated:', priceData);
      return priceData;
    } catch (error) {
      logger.error('Failed to update price from all sources:', error);
      
      // Return cached price if available
      if (this.currentPrice > 0) {
        return this.getCurrentPrice();
      }
      
      throw new Error('Unable to fetch Bitcoin price');
    }
  }

  // Save price to database for historical tracking
  private async savePriceToDatabase(price: number, source: string) {
    try {
      await prisma.priceHistory.create({
        data: {
          priceUsd: price,
          source,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error saving price to database:', error);
      // Don't throw - price updates should continue even if DB save fails
    }
  }

  // Get historical price data
  async getHistoricalPrices(
    hours: number = 24,
    limit: number = 100
  ): Promise<PriceData[]> {
    try {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - hours);

      const prices = await prisma.priceHistory.findMany({
        where: {
          timestamp: {
            gte: startTime,
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: limit,
      });

      return prices.map(price => ({
        priceUsd: Number(price.priceUsd),
        source: price.source,
        timestamp: price.timestamp,
      }));
    } catch (error) {
      logger.error('Error fetching historical prices:', error);
      throw error;
    }
  }

  // Get price statistics
  async getPriceStats(hours: number = 24) {
    try {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - hours);

      const prices = await prisma.priceHistory.findMany({
        where: {
          timestamp: {
            gte: startTime,
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
      });

      if (prices.length === 0) {
        return null;
      }

      const priceValues = prices.map(p => Number(p.priceUsd));
      const firstPrice = priceValues[0];
      const lastPrice = priceValues[priceValues.length - 1];
      
      const change = lastPrice - firstPrice;
      const changePercent = (change / firstPrice) * 100;

      const high = Math.max(...priceValues);
      const low = Math.min(...priceValues);

      return {
        current: this.currentPrice,
        change24h: change,
        changePercent24h: changePercent,
        high24h: high,
        low24h: low,
        timestamp: this.lastUpdate,
      };
    } catch (error) {
      logger.error('Error calculating price stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const priceService = new PriceService();
export default priceService;