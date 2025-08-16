import rateLimit from 'express-rate-limit';

// General rate limit
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limit for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Trading rate limit
export const tradingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 trading requests per minute
  message: {
    success: false,
    error: 'Too many trading requests, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Guest purchase rate limit
export const guestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 guest purchases per hour
  message: {
    success: false,
    error: 'Too many guest purchases, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});