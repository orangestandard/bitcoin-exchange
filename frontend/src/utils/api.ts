import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 403 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const { token } = response.data;
              
              localStorage.setItem('token', token);
              originalRequest.headers.Authorization = `Bearer ${token}`;
              
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client({
        method,
        url,
        data,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('POST', '/auth/login', { email, password });
  }

  async register(email: string, password: string, firstName?: string, lastName?: string) {
    return this.request('POST', '/auth/register', { 
      email, 
      password, 
      firstName, 
      lastName 
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request('POST', '/auth/refresh', { refreshToken });
  }

  async getProfile() {
    return this.request('GET', '/auth/profile');
  }

  async updateProfile(firstName?: string, lastName?: string) {
    return this.request('PUT', '/auth/profile', { firstName, lastName });
  }

  async requestPasswordReset(email: string) {
    return this.request('POST', '/auth/reset-password', { email });
  }

  async confirmPasswordReset(token: string, password: string) {
    return this.request('POST', '/auth/confirm-reset', { token, password });
  }

  async logout() {
    return this.request('POST', '/auth/logout');
  }

  // Wallet endpoints
  async getWalletBalance() {
    return this.request('GET', '/wallet/balance');
  }

  async sendBitcoin(toAddress: string, amountBtc: number, description?: string) {
    return this.request('POST', '/wallet/send', { 
      toAddress, 
      amountBtc, 
      description 
    });
  }

  async getReceiveAddress() {
    return this.request('GET', '/wallet/receive');
  }

  async getTransactions(page = 1, limit = 20, type?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (type) {
      params.append('type', type);
    }

    return this.request('GET', `/wallet/transactions?${params.toString()}`);
  }

  async getTransaction(id: string) {
    return this.request('GET', `/wallet/transactions/${id}`);
  }

  // Trading endpoints
  async getMarketData() {
    return this.request('GET', '/trading/market');
  }

  async buyBitcoin(amountUsd: number) {
    return this.request('POST', '/trading/buy', { amountUsd });
  }

  async sellBitcoin(amountBtc: number) {
    return this.request('POST', '/trading/sell', { amountBtc });
  }

  async getOrders(page = 1, limit = 20, type?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (type) {
      params.append('type', type);
    }

    return this.request('GET', `/trading/orders?${params.toString()}`);
  }

  async getPriceHistory(hours = 24, limit = 100) {
    const params = new URLSearchParams({
      hours: hours.toString(),
      limit: limit.toString(),
    });

    return this.request('GET', `/trading/price-history?${params.toString()}`);
  }

  // Guest endpoints
  async guestBuy(email: string, amountUsd: number) {
    return this.request('POST', '/guest/buy', { email, amountUsd });
  }

  async convertGuestAccount(
    purchaseId: string, 
    password: string, 
    firstName?: string, 
    lastName?: string
  ) {
    return this.request('POST', '/guest/convert', { 
      purchaseId, 
      password, 
      firstName, 
      lastName 
    });
  }

  async getGuestPurchase(purchaseId: string) {
    return this.request('GET', `/guest/purchase/${purchaseId}`);
  }

  async checkGuestConvertible(purchaseId: string) {
    return this.request('GET', `/guest/purchase/${purchaseId}/convertible`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;