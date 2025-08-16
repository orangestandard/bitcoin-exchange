import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import apiClient from '@/utils/api';
import { formatUsd, formatBtc } from '@/utils/helpers';
import toast from 'react-hot-toast';

const guestBuySchema = z.object({
  email: z.string().email('Please enter a valid email'),
  amountUsd: z.number().min(10, 'Minimum purchase is $10').max(10000, 'Maximum purchase is $10,000'),
});

type GuestBuyForm = z.infer<typeof guestBuySchema>;

const GuestBuyPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestBuyForm>({
    resolver: zodResolver(guestBuySchema),
  });

  const onSubmit = async (data: GuestBuyForm) => {
    setIsLoading(true);
    try {
      const response = await apiClient.guestBuy(data.email, data.amountUsd);
      
      if (response.success && response.data) {
        setPurchaseResult(response.data);
        toast.success('Bitcoin purchased successfully!');
      } else {
        toast.error(response.error || 'Purchase failed');
      }
    } catch (error) {
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (purchaseResult) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <Card>
            <Card.Body className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-green-600 dark:text-green-400 text-2xl">✓</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Bitcoin Purchased Successfully!
              </h2>
              
              <div className="space-y-4 text-left">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount Purchased</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatBtc(purchaseResult.amountBtc)} BTC
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    ≈ {formatUsd(purchaseResult.amountUsd)}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Wallet Address</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                    {purchaseResult.walletAddress}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                    {purchaseResult.txHash}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A confirmation email has been sent with your wallet details.
                </p>
                
                <Button 
                  className="w-full"
                  onClick={() => window.location.href = '/register'}
                >
                  Create Account to Manage Your Bitcoin
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/'}
                >
                  Back to Home
                </Button>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-bitcoin rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">₿</span>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Buy Bitcoin Instantly
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Purchase Bitcoin without creating an account. Get started in seconds.
          </p>
        </div>

        {/* Purchase Form */}
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email address"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
              required
            />

            <Input
              label="Amount (USD)"
              type="number"
              placeholder="100"
              error={errors.amountUsd?.message}
              {...register('amountUsd', { valueAsNumber: true })}
              required
            />

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                How it works:
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>1. Enter your email and purchase amount</li>
                <li>2. Complete payment (simulated for demo)</li>
                <li>3. Receive Bitcoin in a temporary wallet</li>
                <li>4. Get wallet details via email</li>
                <li>5. Create account to manage your Bitcoin</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              Buy Bitcoin Now
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-bitcoin hover:text-orange-600">
                Sign in
              </a>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default GuestBuyPage;