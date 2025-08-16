import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { 
  validate, 
  registerSchema, 
  loginSchema, 
  updateProfileSchema,
  resetPasswordSchema,
  confirmResetPasswordSchema
} from '../middleware/validation';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/reset-password', validate(resetPasswordSchema), authController.requestPasswordReset);
router.post('/confirm-reset', validate(confirmResetPasswordSchema), authController.confirmPasswordReset);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validate(updateProfileSchema), authController.updateProfile);
router.post('/logout', authenticateToken, authController.logout);

export default router;