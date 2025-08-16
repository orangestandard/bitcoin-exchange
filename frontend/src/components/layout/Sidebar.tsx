import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Wallet,
  TrendingUp,
  History,
  Settings,
  X,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/helpers';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, public: false },
    { name: 'Wallet', href: '/wallet', icon: Wallet, public: false },
    { name: 'Trading', href: '/trading', icon: TrendingUp, public: true },
    { name: 'History', href: '/history', icon: History, public: false },
    { name: 'Settings', href: '/settings', icon: Settings, public: false },
  ];

  const filteredItems = navigationItems.filter(item => 
    item.public || isAuthenticated
  );

  const isActivePath = (path: string) => {
    return location.pathname === path || 
           (path === '/dashboard' && location.pathname === '/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50',
          'lg:static lg:translate-x-0 lg:w-64'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-bitcoin rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">₿</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              Bitcoin Exchange
            </span>
          </Link>
          
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'nav-link',
                  isActive ? 'nav-link-active' : 'nav-link-inactive'
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Guest section */}
        {!isAuthenticated && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Quick Bitcoin Purchase
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Buy Bitcoin instantly without creating an account
              </p>
              <Link to="/guest-buy">
                <Button variant="primary" size="sm" className="w-full">
                  Buy Bitcoin Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default Sidebar;