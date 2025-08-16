import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onMenuToggle={handleMenuToggle} />
      
      <div className="flex">
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <Sidebar isOpen={true} onClose={handleSidebarClose} />
        </div>
        
        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        </div>
        
        <main className="flex-1 min-h-screen lg:pl-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;