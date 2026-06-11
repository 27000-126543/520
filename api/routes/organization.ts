import { Router } from 'express';
import { organizationController } from '../controllers/OrganizationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, organizationController.getOrganization);
router.post('/', authMiddleware, organizationController.createOrganization);
router.put('/', authMiddleware, organizationController.updateOrganization);

export default router;
