import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
} from './auth.controller';
import { authenticate } from '../../common/middleware/auth.middleware';
import { validateWithZod } from '../../common/middleware/zod-validate.middleware';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../../common/validators/user.validator';

const router = Router();

// Public routes
router.post('/register', validateWithZod(registerSchema), register);
router.post('/login', validateWithZod(loginSchema), login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, validateWithZod(updateProfileSchema), updateProfile);
router.put(
  '/change-password',
  authenticate,
  validateWithZod(changePasswordSchema),
  changePassword
);

export default router;
