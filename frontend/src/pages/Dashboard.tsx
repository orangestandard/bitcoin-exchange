import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import apiClient from '@/utils/api';
import { formatBtc, formatUsd, formatPercent } from '@/utils/helpers';
import { Transaction, Order } from '@/types';

const DashboardPage: React.FC = () => {
  const { user, wallet } = useAuth();
  const { lastPrice, priceChangePercent, isConnected } = useWebSocket();
  const [balance, setBalance] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch wallet balance
        const balanceResponse = await apiClient.getWalletBalance();
        if (balanceResponse.success && balanceResponse.data) {
          setBalance(balanceResponse.data);
        }

        // Fetch recent transactions
        const transactionsResponse = await apiClient.getTransactions(1, 5);
        if (transactionsResponse.success && transactionsResponse.data) {
          setRecentTransactions(transactionsResponse.data.transactions);
        }

        // Fetch recent orders
        const ordersResponse = await apiClient.getOrders(1, 5);
        if (ordersResponse.success && ordersResponse.data) {
          setRecentOrders(ordersResponse.data.orders);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
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
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's what's happening with your Bitcoin portfolio today.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Bitcoin Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-bitcoin bg-opacity-10 rounded-lg mx-auto mb-4">
              <span className="text-bitcoin text-xl font-bold">₿</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Bitcoin Balance
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {balance ? formatBtc(balance.balanceBtc) : '0.00000000'} BTC
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              ≈ {balance ? formatUsd(balance.balanceUsd) : '$0.00'}
            </p>
          </Card>
        </motion.div>

        {/* Current Price */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Bitcoin Price
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {lastPrice ? formatUsd(lastPrice) : '$0.00'}
            </p>
            {priceChangePercent !== null && (
              <p className={`text-sm mt-1 ${priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(priceChangePercent)} (24h)
              </p>
            )}
            <div className="flex items-center justify-center mt-2">
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isConnected ? 'Live' : 'Disconnected'}
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Portfolio Value */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-4">
              <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Portfolio Value
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {balance && lastPrice 
                ? formatUsd(balance.balanceBtc * lastPrice) 
                : '$0.00'
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total USD value
            </p>
          </Card>
        </motion.div>

        {/* Quick Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="text-center h-full flex flex-col justify-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quick Action
            </h3>
            <div className="space-y-2">
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => window.location.href = '/trading'}
              >
                Buy Bitcoin
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.location.href = '/wallet'}
              >
                Send Bitcoin
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Transactions
              </h2>
            </Card.Header>
            <Card.Body>
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          transaction.type === 'BUY' || transaction.type === 'RECEIVE' 
                            ? 'bg-green-100 dark:bg-green-900' 
                            : 'bg-red-100 dark:bg-red-900'
                        }`}>
                          {transaction.type === 'BUY' || transaction.type === 'RECEIVE' ? (
                            <ArrowDownRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {transaction.type}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatBtc(transaction.amountBtc)} BTC
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatUsd(transaction.amountUsd)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No recent transactions
                </p>
              )}
            </Card.Body>
            <Card.Footer>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={() => window.location.href = '/history'}
              >
                View All Transactions
              </Button>
            </Card.Footer>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Orders
              </h2>
            </Card.Header>
            <Card.Body>
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          order.type === 'BUY' 
                            ? 'bg-green-100 dark:bg-green-900' 
                            : 'bg-red-100 dark:bg-red-900'
                        }`}>
                          {order.type === 'BUY' ? (
                            <ArrowDownRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {order.type} Order
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatBtc(order.amountBtc)} BTC
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          @ {formatUsd(order.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No recent orders
                </p>
              )}
            </Card.Body>
            <Card.Footer>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={() => window.location.href = '/trading'}
              >
                View All Orders
              </Button>
            </Card.Footer>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;