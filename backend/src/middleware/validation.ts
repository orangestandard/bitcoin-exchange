import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import logger from '../utils/logger';

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const sendBitcoinSchema = z.object({
  toAddress: z.string().min(1, 'Recipient address is required'),
  amountBtc: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
});

export const buyBitcoinSchema = z.object({
  amountUsd: z.number().positive('Amount must be positive'),
});

export const sellBitcoinSchema = z.object({
  amountBtc: z.number().positive('Amount must be positive'),
});

export const guestBuySchema = z.object({
  email: z.string().email('Invalid email format'),
  amountUsd: z.number().positive('Amount must be positive'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const confirmResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Validation middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn('Validation error:', { errors, body: req.body });
        
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
      }
      
      logger.error('Unexpected validation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
};