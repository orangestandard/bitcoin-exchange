import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useWebSocket } from '@/hooks/useWebSocket';
import { formatUsd, formatPercent } from '@/utils/helpers';
import apiClient from '@/utils/api';

const TradingPage: React.FC = () => {
  const { lastPrice, priceChangePercent, isConnected } = useWebSocket();
  const [marketData, setMarketData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await apiClient.getMarketData();
        if (response.success && response.data) {
          setMarketData(response.data);
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bitcoin Trading
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Buy and sell Bitcoin with real-time market data.
        </p>
      </motion.div>

      {/* Price Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Bitcoin Price
                </h2>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
                  {lastPrice ? formatUsd(lastPrice) : '$0.00'}
                </p>
                {priceChangePercent !== null && (
                  <div className={`flex items-center mt-2 ${priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {priceChangePercent >= 0 ? (
                      <TrendingUp className="w-5 h-5 mr-2" />
                    ) : (
                      <TrendingDown className="w-5 h-5 mr-2" />
                    )}
                    <span className="text-lg font-semibold">
                      {formatPercent(priceChangePercent)} (24h)
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className={`flex items-center ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm">
                    {isConnected ? 'Live Price' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Buy Bitcoin */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <Card.Header>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Buy Bitcoin
              </h3>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  Buy Bitcoin interface coming soon...
                </p>
                <Button disabled>
                  Buy BTC
                </Button>
              </div>
            </Card.Body>
          </Card>
        </motion.div>

        {/* Sell Bitcoin */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <Card.Header>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Sell Bitcoin
              </h3>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-12">
                <TrendingDown className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  Sell Bitcoin interface coming soon...
                </p>
                <Button variant="outline" disabled>
                  Sell BTC
                </Button>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </div>

      {/* Market Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card>
          <Card.Header>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Market Statistics
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Market statistics and charts coming soon...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                This will include price charts, volume, and market analysis.
              </p>
            </div>
          </Card.Body>
        </Card>
      </motion.div>
    </div>
  );
};

export default TradingPage;