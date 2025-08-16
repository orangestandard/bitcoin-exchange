import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format Bitcoin amount
export function formatBtc(amount: number, decimals = 8): string {
  return amount.toFixed(decimals).replace(/\.?0+$/, '');
}

// Format USD amount
export function formatUsd(amount: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

// Format percentage
export function formatPercent(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

// Format date
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// Format relative time
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return formatDate(d);
}

// Truncate address
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (address.length <= start + end) {
    return address;
  }
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

// Validate Bitcoin address (basic)
export function isValidBitcoinAddress(address: string): boolean {
  // Basic validation - in a real app you'd use a proper Bitcoin library
  const regex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
  return regex.test(address);
}

// Validate email
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Generate random color for avatars
export function generateAvatarColor(text: string): string {
  const colors = [
    '#f7931a', '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#ffecd2',
    '#fcb69f', '#a8edea', '#fed6e3', '#ff9a9e', '#fecfef',
  ];
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

// Get initials from name
export function getInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  
  if (firstName) {
    return firstName[0].toUpperCase();
  }
  
  if (email) {
    return email[0].toUpperCase();
  }
  
  return 'U';
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Calculate price change
export function calculatePriceChange(current: number, previous: number): {
  absolute: number;
  percentage: number;
  isPositive: boolean;
} {
  const absolute = current - previous;
  const percentage = previous !== 0 ? (absolute / previous) * 100 : 0;
  
  return {
    absolute,
    percentage,
    isPositive: absolute >= 0,
  };
}

// Format large numbers
export function formatLargeNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num.toString();
}

// Convert BTC to satoshis
export function btcToSatoshis(btc: number): number {
  return Math.round(btc * 100000000);
}

// Convert satoshis to BTC
export function satoshisToBtc(satoshis: number): number {
  return satoshis / 100000000;
}

// Get transaction status color
export function getTransactionStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'text-green-600 dark:text-green-400';
    case 'pending':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'failed':
    case 'cancelled':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

// Get transaction type icon
export function getTransactionTypeIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'buy':
      return '📈';
    case 'sell':
      return '📉';
    case 'send':
      return '📤';
    case 'receive':
      return '📥';
    default:
      return '💱';
  }
}

// Generate QR code data URL (placeholder - would use actual QR library)
export function generateQRDataUrl(text: string): string {
  // This is a placeholder - in a real app you'd use the qrcode library
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <text x="100" y="100" text-anchor="middle" font-family="monospace" font-size="12">
        QR: ${text.slice(0, 20)}...
      </text>
    </svg>
  `)}`;
}

// Local storage helpers
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Handle storage quota exceeded
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Handle errors
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch {
      // Handle errors
    }
  },
};