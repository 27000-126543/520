import { Router } from 'express';
import { spyController } from '../controllers/SpyController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, spyController.getSpies);
router.get('/:id', authMiddleware, spyController.getSpy);
router.post('/recruit', authMiddleware, spyController.recruitSpy);
router.post('/equip-scroll', authMiddleware, spyController.equipScroll);
router.post('/unequip-scroll', authMiddleware, spyController.unequipScroll);
router.put('/:id/upgrade', authMiddleware, spyController.upgradeSkill);

export default router;
