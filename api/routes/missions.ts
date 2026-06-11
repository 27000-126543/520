import { Router } from 'express';
import { missionController } from '../controllers/MissionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, missionController.getMissions);
router.get('/refresh', authMiddleware, missionController.refreshMissions);
router.get('/executions', authMiddleware, missionController.getExecutions);
router.get('/:id', authMiddleware, missionController.getMission);
router.get('/executions/:id', authMiddleware, missionController.getExecution);
router.post('/:id/calculate', authMiddleware, missionController.calculateSuccessRate);
router.post('/:id/accept', authMiddleware, missionController.acceptMission);
router.post('/:id/events/:eventId/action', authMiddleware, missionController.handleAction);

export default router;
