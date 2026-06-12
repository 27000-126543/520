import { Router } from 'express';
import { guildController } from '../controllers/GuildController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, guildController.getMyGuild);
router.get('/list', authMiddleware, guildController.getAllGuilds);
router.post('/:guildId/join', authMiddleware, guildController.joinGuild);
router.get('/:guildId/ranking', authMiddleware, guildController.getContributionRanking);
router.post('/buildings/:buildingId/donate', authMiddleware, guildController.donateMaterial);
router.post('/buildings/:buildingId/upgrade', authMiddleware, guildController.upgradeBuilding);

export default router;
