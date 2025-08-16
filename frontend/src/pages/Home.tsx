import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Zap, Globe } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { formatUsd, formatPercent } from '@/utils/helpers';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { lastPrice, priceChangePercent, isConnected } = useWebSocket();

  const features = [
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Your Bitcoin is secured with military-grade encryption and multi-signature wallets.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Buy, sell, and transfer Bitcoin in seconds with our optimized trading engine.',
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Trade Bitcoin 24/7 from anywhere in the world with our mobile-first platform.',
    },
    {
      icon: TrendingUp,
      title: 'Real-time Prices',
      description: 'Get live Bitcoin prices and market data to make informed trading decisions.',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
            The Future of{' '}
            <span className="text-bitcoin">Bitcoin</span>{' '}
            Trading
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Buy, sell, and store Bitcoin with confidence. Our secure platform makes 
            cryptocurrency trading simple and accessible for everyone.
          </p>
        </motion.div>

        {/* Price Display */}
        {isConnected && lastPrice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="inline-flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">Bitcoin Price</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatUsd(lastPrice)}
              </p>
            </div>
            {priceChangePercent !== null && (
              <div className={`text-right ${priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <p className="text-sm">24h Change</p>
                <p className="text-xl font-semibold">
                  {formatPercent(priceChangePercent)}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/trading">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Start Trading
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link to="/guest-buy">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Buy Bitcoin Now
                </Button>
              </Link>
            </>
          )}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We've built the most secure, fast, and user-friendly Bitcoin exchange 
            to help you achieve your financial goals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              >
                <Card className="text-center h-full hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-bitcoin bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-bitcoin" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="bg-gradient-to-r from-bitcoin to-orange-600 rounded-2xl p-8 md:p-12 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center space-y-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Join thousands of users who trust our platform for their Bitcoin needs. 
            Create your account in minutes and start trading today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated && (
              <>
                <Link to="/register">
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="w-full sm:w-auto bg-white text-bitcoin hover:bg-gray-100"
                  >
                    Create Account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-bitcoin"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;