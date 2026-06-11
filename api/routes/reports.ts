import { Router } from 'express';
import { reportController } from '../controllers/ReportController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/weekly', authMiddleware, reportController.getWeeklyReport);
router.get('/export', authMiddleware, reportController.exportPDF);
router.get('/rankings/:type', authMiddleware, reportController.getRankings);
router.get('/announcements', authMiddleware, reportController.getAnnouncements);

export default router;
