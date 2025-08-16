import { Router } from 'express';
import { walletController } from '../controllers/walletController';
import { authenticateToken } from '../middleware/auth';
import { validate, sendBitcoinSchema } from '../middleware/validation';

const router = Router();

// All wallet routes require authentication
router.use(authenticateToken);

// Wallet routes
router.get('/balance', walletController.getBalance);
router.post('/send', validate(sendBitcoinSchema), walletController.sendBitcoin);
router.get('/receive', walletController.getReceiveAddress);
router.get('/transactions', walletController.getTransactions);
router.get('/transactions/:id', walletController.getTransaction);

export default router;