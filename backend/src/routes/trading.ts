import { Router } from 'express';
import { tradingController } from '../controllers/tradingController';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { validate, buyBitcoinSchema, sellBitcoinSchema } from '../middleware/validation';

const router = Router();

// Public routes (market data)
router.get('/market', optionalAuth, tradingController.getMarketData);
router.get('/price-history', optionalAuth, tradingController.getPriceHistory);

// Protected routes (trading)
router.post('/buy', authenticateToken, validate(buyBitcoinSchema), tradingController.buyBitcoin);
router.post('/sell', authenticateToken, validate(sellBitcoinSchema), tradingController.sellBitcoin);
router.get('/orders', authenticateToken, tradingController.getOrders);

export default router;