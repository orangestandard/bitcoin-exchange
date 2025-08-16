import { Request, Response } from 'express';
import prisma from '../utils/database';
import { walletService } from '../services/walletService';
import priceService from '../services/priceService';
import { hashPassword } from '../utils/auth';
import { generateTokens } from '../utils/jwt';
import logger from '../utils/logger';

export class GuestController {
  // Guest Bitcoin purchase
  async guestBuy(req: Request, res: Response) {
    try {
      const { email, amountUsd } = req.body;

      if (amountUsd <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be positive',
        });
      }

      // Get current Bitcoin price
      const currentPrice = priceService.getCurrentPrice();
      const fee = amountUsd * 0.015; // 1.5% fee for guest purchases
      const finalAmountUsd = amountUsd - fee;
      const amountBtc = finalAmountUsd / currentPrice.priceUsd;

      // Create temporary wallet for guest
      const walletData = await walletService.createGuestWallet(email);

      // Create guest purchase record
      const guestPurchase = await prisma.guestPurchase.create({
        data: {
          email,
          amountBtc,
          amountUsd: finalAmountUsd,
          walletAddress: walletData.address,
          privateKeyEncrypted: walletData.privateKeyEncrypted,
        },
      });

      // Simulate Bitcoin being sent to the guest wallet
      // In a real implementation, you would:
      // 1. Process payment
      // 2. Send actual Bitcoin to the generated address
      const simulatedTxId = this.generateTxId();

      await prisma.guestPurchase.update({
        where: { id: guestPurchase.id },
        data: { txHash: simulatedTxId },
      });

      logger.info('Guest Bitcoin purchase:', {
        email,
        amountUsd,
        amountBtc,
        address: walletData.address,
        txId: simulatedTxId,
      });

      res.json({
        success: true,
        data: {
          purchaseId: guestPurchase.id,
          amountBtc,
          amountUsd: finalAmountUsd,
          fee,
          walletAddress: walletData.address,
          txHash: simulatedTxId,
          message: 'Bitcoin purchased successfully! Check your email for details.',
        },
        message: 'Bitcoin purchased successfully',
      });
    } catch (error) {
      logger.error('Guest buy error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process guest purchase',
      });
    }
  }

  // Convert guest account to full account
  async convertGuestAccount(req: Request, res: Response) {
    try {
      const { purchaseId, password, firstName, lastName } = req.body;

      if (!password || password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters',
        });
      }

      // Find guest purchase
      const guestPurchase = await prisma.guestPurchase.findUnique({
        where: { id: purchaseId },
      });

      if (!guestPurchase) {
        return res.status(404).json({
          success: false,
          error: 'Guest purchase not found',
        });
      }

      if (guestPurchase.isConverted) {
        return res.status(400).json({
          success: false,
          error: 'Account already converted',
        });
      }

      // Check if user already exists with this email
      const existingUser = await prisma.user.findUnique({
        where: { email: guestPurchase.email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists',
        });
      }

      // Create user account
      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email: guestPurchase.email,
          passwordHash,
          firstName,
          lastName,
          isVerified: true, // Auto-verify since they made a purchase
        },
      });

      // Create wallet with the guest purchase data
      const wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          address: guestPurchase.walletAddress,
          privateKeyEncrypted: guestPurchase.privateKeyEncrypted,
          publicKey: '', // Would be derived from private key
          balanceBtc: guestPurchase.amountBtc,
          balanceUsd: guestPurchase.amountUsd,
        },
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'BUY',
          amountBtc: guestPurchase.amountBtc,
          amountUsd: guestPurchase.amountUsd,
          fee: 0,
          status: 'CONFIRMED',
          txHash: guestPurchase.txHash,
          toAddress: guestPurchase.walletAddress,
          description: 'Guest purchase conversion',
        },
      });

      // Mark guest purchase as converted
      await prisma.guestPurchase.update({
        where: { id: purchaseId },
        data: {
          isConverted: true,
          convertedUserId: user.id,
        },
      });

      // Generate tokens
      const { token, refreshToken } = generateTokens(user);

      logger.info('Guest account converted:', {
        userId: user.id,
        email: user.email,
        purchaseId,
      });

      res.json({
        success: true,
        data: {
          token,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          wallet: {
            id: wallet.id,
            userId: wallet.userId,
            address: wallet.address,
            balanceBtc: Number(wallet.balanceBtc),
            balanceUsd: Number(wallet.balanceUsd),
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt,
          },
        },
        message: 'Account created successfully with your Bitcoin!',
      });
    } catch (error) {
      logger.error('Convert guest account error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to convert guest account',
      });
    }
  }

  // Get guest purchase details
  async getGuestPurchase(req: Request, res: Response) {
    try {
      const { purchaseId } = req.params;

      const guestPurchase = await prisma.guestPurchase.findUnique({
        where: { id: purchaseId },
      });

      if (!guestPurchase) {
        return res.status(404).json({
          success: false,
          error: 'Purchase not found',
        });
      }

      res.json({
        success: true,
        data: {
          id: guestPurchase.id,
          email: guestPurchase.email,
          amountBtc: Number(guestPurchase.amountBtc),
          amountUsd: Number(guestPurchase.amountUsd),
          walletAddress: guestPurchase.walletAddress,
          txHash: guestPurchase.txHash,
          isConverted: guestPurchase.isConverted,
          createdAt: guestPurchase.createdAt,
        },
      });
    } catch (error) {
      logger.error('Get guest purchase error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get purchase details',
      });
    }
  }

  // Check if guest purchase can be converted
  async checkConvertible(req: Request, res: Response) {
    try {
      const { purchaseId } = req.params;

      const guestPurchase = await prisma.guestPurchase.findUnique({
        where: { id: purchaseId },
      });

      if (!guestPurchase) {
        return res.status(404).json({
          success: false,
          error: 'Purchase not found',
        });
      }

      // Check if email already has an account
      const existingUser = await prisma.user.findUnique({
        where: { email: guestPurchase.email },
      });

      const canConvert = !guestPurchase.isConverted && !existingUser;

      res.json({
        success: true,
        data: {
          canConvert,
          isConverted: guestPurchase.isConverted,
          hasExistingAccount: !!existingUser,
          email: guestPurchase.email,
        },
      });
    } catch (error) {
      logger.error('Check convertible error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check conversion status',
      });
    }
  }

  // Helper method to generate simulated transaction ID
  private generateTxId(): string {
    return Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}

export const guestController = new GuestController();