import { Router } from 'express';
import { marketController } from '../controllers/MarketController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/listings', authMiddleware, marketController.getListings);
router.get('/histories', authMiddleware, marketController.getTradeHistories);
router.get('/my-trades', authMiddleware, marketController.getMyTrades);
router.get('/price-trends', authMiddleware, marketController.getPriceTrends);
router.get('/scrolls', authMiddleware, marketController.getMyScrolls);
router.get('/price-suggestion/:rarity', authMiddleware, marketController.getPriceSuggestion);
router.post('/listings', authMiddleware, marketController.createListing);
router.post('/listings/:id/buy', authMiddleware, marketController.buyListing);
router.delete('/listings/:id', authMiddleware, marketController.cancelListing);

export default router;
