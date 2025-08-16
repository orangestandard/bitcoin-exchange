import { Request, Response } from 'express';
import { walletService } from '../services/walletService';
import priceService from '../services/priceService';
import logger from '../utils/logger';
import { isValidBitcoinAddress } from '../utils/bitcoin';

export class WalletController {
  // Get wallet balance
  async getBalance(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const balance = await walletService.getWalletBalance(req.user.userId);
      const currentPrice = priceService.getCurrentPrice();

      // Calculate USD balance based on current BTC price
      const balanceUsd = balance.balanceBtc * currentPrice.priceUsd;

      res.json({
        success: true,
        data: {
          ...balance,
          balanceUsd: Number(balanceUsd.toFixed(2)),
          currentPrice: currentPrice.priceUsd,
        },
      });
    } catch (error) {
      logger.error('Get balance error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get wallet balance',
      });
    }
  }

  // Send Bitcoin
  async sendBitcoin(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { toAddress, amountBtc, description } = req.body;

      // Validate address
      if (!isValidBitcoinAddress(toAddress)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Bitcoin address',
        });
      }

      // Validate amount
      if (amountBtc <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be positive',
        });
      }

      // Check if user has enough balance
      const balance = await walletService.getWalletBalance(req.user.userId);
      if (balance.balanceBtc < amountBtc) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient balance',
        });
      }

      // Send Bitcoin
      const result = await walletService.sendBitcoin(
        req.user.userId,
        toAddress,
        amountBtc,
        description
      );

      res.json({
        success: true,
        data: {
          txId: result.txId,
          fee: result.fee,
          transaction: {
            ...result.transaction,
            amountBtc: Number(result.transaction.amountBtc),
            amountUsd: Number(result.transaction.amountUsd),
            fee: Number(result.transaction.fee),
          },
        },
        message: 'Bitcoin sent successfully',
      });
    } catch (error) {
      logger.error('Send Bitcoin error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to send Bitcoin',
      });
    }
  }

  // Get receive address and QR code
  async getReceiveAddress(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const balance = await walletService.getWalletBalance(req.user.userId);
      const qrCode = await walletService.generateReceiveQR(req.user.userId);

      res.json({
        success: true,
        data: {
          address: balance.address,
          qrCode,
        },
      });
    } catch (error) {
      logger.error('Get receive address error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get receive address',
      });
    }
  }

  // Get transaction history
  async getTransactions(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as any;

      const result = await walletService.getTransactionHistory(
        req.user.userId,
        page,
        limit,
        type
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get transaction history',
      });
    }
  }

  // Get single transaction details
  async getTransaction(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { id } = req.params;

      // In a real implementation, you would fetch transaction details
      // For now, we'll return a placeholder
      res.json({
        success: true,
        data: {
          message: 'Transaction details endpoint - to be implemented',
          transactionId: id,
        },
      });
    } catch (error) {
      logger.error('Get transaction error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get transaction details',
      });
    }
  }
}

export const walletController = new WalletController();