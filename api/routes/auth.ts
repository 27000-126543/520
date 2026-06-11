import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authMiddleware, authController.me);

export default router;
