import { Request, Response } from 'express';
import prisma from '../utils/database';
import { hashPassword, comparePassword, generateRandomToken } from '../utils/auth';
import { generateTokens, refreshAccessToken } from '../utils/jwt';
import { walletService } from '../services/walletService';
import logger from '../utils/logger';
import { AuthResponse, User } from '../types';

export class AuthController {
  // User registration
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists',
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Generate verification token
      const verificationToken = generateRandomToken();

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          verificationToken,
        },
      });

      // Create wallet for user
      const wallet = await walletService.createUserWallet(user.id);

      // Generate tokens
      const { token, refreshToken } = generateTokens(user);

      // Log registration
      logger.info('User registered:', { 
        userId: user.id, 
        email: user.email 
      });

      const response: AuthResponse = {
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
      };

      res.status(201).json({
        success: true,
        data: response,
        message: 'User registered successfully',
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // User login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: { wallet: true },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }

      // Generate tokens
      const { token, refreshToken } = generateTokens(user);

      // Log login
      logger.info('User logged in:', { 
        userId: user.id, 
        email: user.email 
      });

      const response: AuthResponse = {
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
        wallet: user.wallet ? {
          id: user.wallet.id,
          userId: user.wallet.userId,
          address: user.wallet.address,
          balanceBtc: Number(user.wallet.balanceBtc),
          balanceUsd: Number(user.wallet.balanceUsd),
          createdAt: user.wallet.createdAt,
          updatedAt: user.wallet.updatedAt,
        } : undefined,
      };

      res.json({
        success: true,
        data: response,
        message: 'Login successful',
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Refresh token
  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token required',
        });
      }

      // Generate new access token
      const newToken = refreshAccessToken(refreshToken);

      res.json({
        success: true,
        data: { token: newToken },
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      logger.warn('Token refresh failed:', error);
      res.status(403).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }
  }

  // Get current user profile
  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { wallet: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      const response = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        wallet: user.wallet ? {
          id: user.wallet.id,
          userId: user.wallet.userId,
          address: user.wallet.address,
          balanceBtc: Number(user.wallet.balanceBtc),
          balanceUsd: Number(user.wallet.balanceUsd),
          createdAt: user.wallet.createdAt,
          updatedAt: user.wallet.updatedAt,
        } : null,
      };

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Update user profile
  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { firstName, lastName } = req.body;

      const user = await prisma.user.update({
        where: { id: req.user.userId },
        data: {
          firstName,
          lastName,
        },
      });

      logger.info('Profile updated:', { userId: user.id });

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        message: 'Profile updated successfully',
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Request password reset
  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if email exists or not
        return res.json({
          success: true,
          message: 'If the email exists, a reset link has been sent',
        });
      }

      // Generate reset token
      const resetToken = generateRandomToken();
      const resetTokenExpiry = new Date();
      resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour expiry

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // In a real app, send email with reset link
      logger.info('Password reset requested:', { 
        userId: user.id, 
        email: user.email,
        resetToken 
      });

      res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
    } catch (error) {
      logger.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Confirm password reset
  async confirmPasswordReset(req: Request, res: Response) {
    try {
      const { token, password } = req.body;

      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token',
        });
      }

      // Hash new password
      const passwordHash = await hashPassword(password);

      // Update user password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      logger.info('Password reset completed:', { userId: user.id });

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      logger.error('Password reset confirmation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Logout (in a real app, you might want to blacklist the token)
  async logout(req: Request, res: Response) {
    try {
      // In a stateless JWT setup, logout is handled client-side
      // But we can log the event
      if (req.user) {
        logger.info('User logged out:', { userId: req.user.userId });
      }

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}

export const authController = new AuthController();