import { Router } from 'express';
import { getMe, login, logout, register, updatePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimits.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, passwordSchema, registerSchema } from '../validation.js';

const router = Router();
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/password', protect, validate(passwordSchema), updatePassword);
export default router;

