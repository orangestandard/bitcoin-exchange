// Common types shared between frontend and backend

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  address: string;
  balanceBtc: number;
  balanceUsd: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId?: string;
  type: TransactionType;
  amountBtc: number;
  amountUsd: number;
  fee: number;
  status: TransactionStatus;
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  confirmations: number;
  description?: string;
  guestEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  type: OrderType;
  amountBtc: number;
  amountUsd: number;
  price: number;
  status: OrderStatus;
  createdAt: Date;
  completedAt?: Date;
}

export interface GuestPurchase {
  id: string;
  email: string;
  amountBtc: number;
  amountUsd: number;
  walletAddress: string;
  txHash?: string;
  isConverted: boolean;
  convertedUserId?: string;
  createdAt: Date;
}

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
  GUEST_BUY = 'GUEST_BUY'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  wallet?: Wallet;
}

// Trading types
export interface MarketData {
  currentPrice: number;
  stats: {
    current: number;
    change24h: number;
    changePercent24h: number;
    high24h: number;
    low24h: number;
    timestamp: Date;
  };
  historicalPrices: Array<{
    price: number;
    timestamp: Date;
  }>;
  lastUpdate: Date;
}

export interface PricePoint {
  price: number;
  timestamp: Date;
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

export interface PriceUpdateMessage extends WebSocketMessage {
  type: 'PRICE_UPDATE';
  data: {
    priceUsd: number;
    change24h: number;
    changePercent24h: number;
    source: string;
  };
}

// Form types
export interface SendBitcoinForm {
  toAddress: string;
  amountBtc: number;
  description?: string;
}

export interface BuyBitcoinForm {
  amountUsd: number;
}

export interface SellBitcoinForm {
  amountBtc: number;
}

export interface GuestBuyForm {
  email: string;
  amountUsd: number;
}

export interface UpdateProfileForm {
  firstName?: string;
  lastName?: string;
}

// UI Component props
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  error?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

// App state types
export interface AuthState {
  user: User | null;
  wallet: Wallet | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface WalletState {
  balance: {
    balanceBtc: number;
    balanceUsd: number;
    currentPrice: number;
  } | null;
  transactions: Transaction[];
  isLoading: boolean;
}

export interface TradingState {
  marketData: MarketData | null;
  orders: Order[];
  isLoading: boolean;
}

// Theme types
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}