import { Router } from 'express';
import { guildController } from '../controllers/GuildController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, guildController.getMyGuild);
router.post('/buildings/:buildingId/donate', authMiddleware, guildController.donateMaterial);
router.post('/buildings/:buildingId/upgrade', authMiddleware, guildController.upgradeBuilding);

export default router;
