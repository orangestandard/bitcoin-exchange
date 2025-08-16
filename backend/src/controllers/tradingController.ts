import { Request, Response } from 'express';
import prisma from '../utils/database';
import { walletService } from '../services/walletService';
import priceService from '../services/priceService';
import logger from '../utils/logger';
import { TransactionType, TransactionStatus, OrderType, OrderStatus } from '../types';

export class TradingController {
  // Get current market price and stats
  async getMarketData(req: Request, res: Response) {
    try {
      const currentPrice = priceService.getCurrentPrice();
      const stats = await priceService.getPriceStats(24);
      const historicalPrices = await priceService.getHistoricalPrices(24, 50);

      res.json({
        success: true,
        data: {
          currentPrice: currentPrice.priceUsd,
          stats: stats || {
            current: currentPrice.priceUsd,
            change24h: 0,
            changePercent24h: 0,
            high24h: currentPrice.priceUsd,
            low24h: currentPrice.priceUsd,
            timestamp: currentPrice.timestamp,
          },
          historicalPrices: historicalPrices.map(price => ({
            price: price.priceUsd,
            timestamp: price.timestamp,
          })),
          lastUpdate: currentPrice.timestamp,
        },
      });
    } catch (error) {
      logger.error('Get market data error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get market data',
      });
    }
  }

  // Buy Bitcoin with USD
  async buyBitcoin(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { amountUsd } = req.body;

      if (amountUsd <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be positive',
        });
      }

      // Get current Bitcoin price
      const currentPrice = priceService.getCurrentPrice();
      const amountBtc = amountUsd / currentPrice.priceUsd;

      // In a real implementation, you would:
      // 1. Process payment (credit card, bank transfer, etc.)
      // 2. Verify payment
      // 3. Execute the order
      
      // For this demo, we'll simulate instant execution
      const fee = amountUsd * 0.01; // 1% fee
      const finalAmountUsd = amountUsd - fee;
      const finalAmountBtc = finalAmountUsd / currentPrice.priceUsd;

      // Create order record
      const order = await prisma.order.create({
        data: {
          userId: req.user.userId,
          type: OrderType.BUY,
          amountBtc: finalAmountBtc,
          amountUsd: finalAmountUsd,
          price: currentPrice.priceUsd,
          status: OrderStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId: req.user.userId,
          type: TransactionType.BUY,
          amountBtc: finalAmountBtc,
          amountUsd: finalAmountUsd,
          fee: fee / currentPrice.priceUsd, // Convert fee to BTC
          status: TransactionStatus.CONFIRMED,
          description: `Buy Bitcoin for $${amountUsd}`,
        },
      });

      // Update wallet balance
      const currentBalance = await walletService.getWalletBalance(req.user.userId);
      const newBalanceBtc = currentBalance.balanceBtc + finalAmountBtc;
      const newBalanceUsd = newBalanceBtc * currentPrice.priceUsd;

      await walletService.updateWalletBalance(
        req.user.userId,
        newBalanceBtc,
        newBalanceUsd
      );

      logger.info('Bitcoin purchased:', {
        userId: req.user.userId,
        amountUsd,
        amountBtc: finalAmountBtc,
        price: currentPrice.priceUsd,
      });

      res.json({
        success: true,
        data: {
          order: {
            ...order,
            amountBtc: Number(order.amountBtc),
            amountUsd: Number(order.amountUsd),
            price: Number(order.price),
          },
          transaction: {
            ...transaction,
            amountBtc: Number(transaction.amountBtc),
            amountUsd: Number(transaction.amountUsd),
            fee: Number(transaction.fee),
          },
          newBalance: {
            balanceBtc: newBalanceBtc,
            balanceUsd: newBalanceUsd,
          },
        },
        message: 'Bitcoin purchased successfully',
      });
    } catch (error) {
      logger.error('Buy Bitcoin error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to buy Bitcoin',
      });
    }
  }

  // Sell Bitcoin for USD
  async sellBitcoin(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { amountBtc } = req.body;

      if (amountBtc <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be positive',
        });
      }

      // Check user balance
      const currentBalance = await walletService.getWalletBalance(req.user.userId);
      if (currentBalance.balanceBtc < amountBtc) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient Bitcoin balance',
        });
      }

      // Get current Bitcoin price
      const currentPrice = priceService.getCurrentPrice();
      const amountUsd = amountBtc * currentPrice.priceUsd;

      // Calculate fee (1% of USD value)
      const fee = amountUsd * 0.01;
      const finalAmountUsd = amountUsd - fee;

      // Create order record
      const order = await prisma.order.create({
        data: {
          userId: req.user.userId,
          type: OrderType.SELL,
          amountBtc,
          amountUsd: finalAmountUsd,
          price: currentPrice.priceUsd,
          status: OrderStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId: req.user.userId,
          type: TransactionType.SELL,
          amountBtc,
          amountUsd: finalAmountUsd,
          fee: fee / currentPrice.priceUsd, // Convert fee to BTC
          status: TransactionStatus.CONFIRMED,
          description: `Sell ${amountBtc} BTC for $${finalAmountUsd}`,
        },
      });

      // Update wallet balance
      const newBalanceBtc = currentBalance.balanceBtc - amountBtc;
      const newBalanceUsd = newBalanceBtc * currentPrice.priceUsd;

      await walletService.updateWalletBalance(
        req.user.userId,
        newBalanceBtc,
        newBalanceUsd
      );

      logger.info('Bitcoin sold:', {
        userId: req.user.userId,
        amountBtc,
        amountUsd: finalAmountUsd,
        price: currentPrice.priceUsd,
      });

      res.json({
        success: true,
        data: {
          order: {
            ...order,
            amountBtc: Number(order.amountBtc),
            amountUsd: Number(order.amountUsd),
            price: Number(order.price),
          },
          transaction: {
            ...transaction,
            amountBtc: Number(transaction.amountBtc),
            amountUsd: Number(transaction.amountUsd),
            fee: Number(transaction.fee),
          },
          newBalance: {
            balanceBtc: newBalanceBtc,
            balanceUsd: newBalanceUsd,
          },
        },
        message: 'Bitcoin sold successfully',
      });
    } catch (error) {
      logger.error('Sell Bitcoin error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to sell Bitcoin',
      });
    }
  }

  // Get trading history (orders)
  async getOrders(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as OrderType;

      const skip = (page - 1) * limit;
      
      const where: any = { userId: req.user.userId };
      if (type) {
        where.type = type;
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.order.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          orders: orders.map(order => ({
            ...order,
            amountBtc: Number(order.amountBtc),
            amountUsd: Number(order.amountUsd),
            price: Number(order.price),
          })),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error('Get orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get trading history',
      });
    }
  }

  // Get price history for charts
  async getPriceHistory(req: Request, res: Response) {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const limit = parseInt(req.query.limit as string) || 100;

      const prices = await priceService.getHistoricalPrices(hours, limit);

      res.json({
        success: true,
        data: {
          prices: prices.map(price => ({
            price: price.priceUsd,
            timestamp: price.timestamp,
          })),
          timeframe: `${hours}h`,
        },
      });
    } catch (error) {
      logger.error('Get price history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get price history',
      });
    }
  }
}

export const tradingController = new TradingController();