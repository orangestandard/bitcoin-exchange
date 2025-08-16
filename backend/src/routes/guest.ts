import { Router } from 'express';
import { guestController } from '../controllers/guestController';
import { validate, guestBuySchema } from '../middleware/validation';

const router = Router();

// Guest Bitcoin purchase
router.post('/buy', validate(guestBuySchema), guestController.guestBuy);

// Convert guest account to full account
router.post('/convert', guestController.convertGuestAccount);

// Get guest purchase details
router.get('/purchase/:purchaseId', guestController.getGuestPurchase);

// Check if guest purchase can be converted
router.get('/purchase/:purchaseId/convertible', guestController.checkConvertible);

export default router;