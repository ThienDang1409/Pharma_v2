import { Router } from 'express';
import {
  getAllInformation,
  getInformationTree,
  getInformationById,
  getInformationBySlug,
  getChildren,
  createInformation,
  updateInformation,
  deleteInformation,
  reorderInformation,
} from './information.controller';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import { validateWithZod } from '../../common/middleware/zod-validate.middleware';
import {
  createInformationSchema,
  updateInformationSchema,
  informationQuerySchema,
  reorderInformationSchema,
} from '../../common/validators/information.validator';

const router = Router();

// Public routes
router.get('/', validateWithZod(informationQuerySchema, 'query'), getAllInformation);
router.get('/tree', getInformationTree);
router.get('/slug/:slug', getInformationBySlug);
router.get('/:id', getInformationById);
router.get('/:id/children', getChildren);

// Protected routes (Admin only)
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateWithZod(createInformationSchema),
  createInformation
);

router.put(
  '/reorder',
  authenticate,
  authorize('admin'),
  validateWithZod(reorderInformationSchema),
  reorderInformation
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateWithZod(updateInformationSchema),
  updateInformation
);

router.delete('/:id', authenticate, authorize('admin'), deleteInformation);

export default router;
