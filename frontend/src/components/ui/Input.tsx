import React from 'react';
import { cn } from '@/utils/helpers';
import { InputProps } from '@/types';

const Input: React.FC<InputProps> = ({
  label,
  error,
  placeholder,
  type = 'text',
  value,
  onChange,
  disabled = false,
  required = false,
  className,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'form-input',
          error && 'border-red-500 focus:ring-red-500',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default Input;