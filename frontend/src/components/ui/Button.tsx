import React from 'react';
import { cn } from '@/utils/helpers';
import { ButtonProps } from '@/types';

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-bitcoin hover:bg-orange-600 text-white focus:ring-bitcoin',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    outline: 'border-2 border-bitcoin text-bitcoin hover:bg-bitcoin hover:text-white focus:ring-bitcoin',
    ghost: 'text-bitcoin hover:bg-bitcoin hover:bg-opacity-10 focus:ring-bitcoin',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        'btn-hover-lift',
        className
      )}
    >
      {loading && (
        <div className="spinner mr-2" />
      )}
      {children}
    </button>
  );
};

export default Button;