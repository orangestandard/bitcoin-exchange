// Common types used across the application

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

export interface PriceData {
  id: string;
  priceUsd: number;
  source: string;
  timestamp: Date;
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

// API Request/Response types
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

export interface SendBitcoinRequest {
  toAddress: string;
  amountBtc: number;
  description?: string;
}

export interface BuyBitcoinRequest {
  amountUsd: number;
}

export interface SellBitcoinRequest {
  amountBtc: number;
}

export interface GuestBuyRequest {
  email: string;
  amountUsd: number;
}

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
    source: string;
  };
}

export interface TransactionUpdateMessage extends WebSocketMessage {
  type: 'TRANSACTION_UPDATE';
  data: Transaction;
}

export interface BalanceUpdateMessage extends WebSocketMessage {
  type: 'BALANCE_UPDATE';
  data: {
    balanceBtc: number;
    balanceUsd: number;
  };
}