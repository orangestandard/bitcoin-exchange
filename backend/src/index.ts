import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'http';
import WebSocket from 'ws';
import logger from './utils/logger';
import { generalLimiter, authLimiter, tradingLimiter, guestLimiter } from './middleware/rateLimiting';

// Import routes
import authRoutes from './routes/auth';
import walletRoutes from './routes/wallet';
import tradingRoutes from './routes/trading';
import guestRoutes from './routes/guest';

// Import services
import priceService from './services/priceService';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Bitcoin Exchange API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes with specific rate limits
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/trading', tradingLimiter, tradingRoutes);
app.use('/api/guest', guestLimiter, guestRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Create HTTP server
const server = new Server(app);

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ 
  server,
  path: '/ws',
  verifyClient: (info) => {
    // Basic origin verification
    const origin = info.origin;
    const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
    return origin === allowedOrigin;
  }
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  logger.info('WebSocket connection established', { 
    ip: req.socket.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  // Send current price immediately
  const currentPrice = priceService.getCurrentPrice();
  ws.send(JSON.stringify({
    type: 'PRICE_UPDATE',
    data: {
      priceUsd: currentPrice.priceUsd,
      change24h: 0, // Will be calculated from price stats
      source: currentPrice.source,
    },
    timestamp: currentPrice.timestamp,
  }));

  // Handle ping/pong for connection keep-alive
  ws.on('ping', () => {
    ws.pong();
  });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      logger.debug('WebSocket message received:', data);
      
      // Handle different message types if needed
      if (data.type === 'PING') {
        ws.send(JSON.stringify({
          type: 'PONG',
          timestamp: new Date(),
        }));
      }
    } catch (error) {
      logger.warn('Invalid WebSocket message:', { message: message.toString(), error });
    }
  });

  ws.on('close', (code, reason) => {
    logger.info('WebSocket connection closed', { code, reason: reason.toString() });
  });

  ws.on('error', (error) => {
    logger.error('WebSocket error:', error);
  });
});

// Broadcast price updates to all connected clients
const broadcastPriceUpdate = (priceData: any) => {
  const message = JSON.stringify({
    type: 'PRICE_UPDATE',
    data: priceData,
    timestamp: new Date(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// Set up price update broadcasting
let lastBroadcastPrice = 0;
setInterval(async () => {
  try {
    const currentPrice = priceService.getCurrentPrice();
    
    // Only broadcast if price changed significantly (0.1% change)
    const priceChange = Math.abs(currentPrice.priceUsd - lastBroadcastPrice);
    const changePercent = (priceChange / lastBroadcastPrice) * 100;
    
    if (changePercent >= 0.1 || lastBroadcastPrice === 0) {
      const stats = await priceService.getPriceStats(24);
      
      broadcastPriceUpdate({
        priceUsd: currentPrice.priceUsd,
        change24h: stats?.change24h || 0,
        changePercent24h: stats?.changePercent24h || 0,
        source: currentPrice.source,
      });
      
      lastBroadcastPrice = currentPrice.priceUsd;
    }
  } catch (error) {
    logger.error('Error broadcasting price update:', error);
  }
}, 5000); // Check every 5 seconds

// Start server
server.listen(PORT, () => {
  logger.info(`Bitcoin Exchange API server started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default app;