import { Router } from 'express';
import { marketController } from '../controllers/MarketController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/intel', authMiddleware, marketController.getListings);
router.get('/scrolls', authMiddleware, marketController.getMyScrolls);
router.get('/price/:rarity', authMiddleware, marketController.getPriceSuggestion);
router.post('/intel', authMiddleware, marketController.createListing);
router.post('/intel/:id/buy', authMiddleware, marketController.buyListing);
router.delete('/intel/:id', authMiddleware, marketController.cancelListing);

export default router;
