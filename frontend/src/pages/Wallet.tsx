import React from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

const WalletPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bitcoin Wallet
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your Bitcoin wallet, send and receive Bitcoin.
        </p>
      </motion.div>

      <Card>
        <Card.Body>
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Wallet functionality coming soon...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              This page will include wallet balance, send/receive Bitcoin, and QR codes.
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default WalletPage;