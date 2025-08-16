import jwt from 'jsonwebtoken';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const generateTokens = (user: User) => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return { token, refreshToken };
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (refreshToken: string): JWTPayload => {
  return jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JWTPayload;
};

export const refreshAccessToken = (refreshToken: string) => {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const newPayload: JWTPayload = {
      userId: payload.userId,
      email: payload.email,
    };
    
    const newToken = jwt.sign(newPayload, JWT_SECRET, { expiresIn: '15m' });
    return newToken;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};