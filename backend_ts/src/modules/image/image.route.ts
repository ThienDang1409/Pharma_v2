import { Router } from 'express';
import {
  uploadImage,
  uploadMultiple,
  getAllImages,
  getImageById,
  updateImage,
  addReference,
  removeReference,
  transformImage,
  deleteImage,
  cleanupUnused,
  getImagesByEntity,
} from './image.controller';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import { validateWithZod } from '../../common/middleware/zod-validate.middleware';
import {
  uploadSingle,
  uploadMultiple as uploadMultipleMiddleware,
  handleMulterError,
} from '../../common/middleware/upload.middleware';
import {
  uploadImageSchema,
  updateImageSchema,
  imageQuerySchema,
  addReferenceSchema,
  removeReferenceSchema,
  transformImageSchema,
  bulkUploadSchema,
} from '../../common/validators/image.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload routes
router.post(
  '/upload',
  uploadSingle,
  handleMulterError,
  validateWithZod(uploadImageSchema),
  uploadImage
);

router.post(
  '/upload-multiple',
  uploadMultipleMiddleware,
  handleMulterError,
  validateWithZod(bulkUploadSchema),
  uploadMultiple
);

// Query routes
router.get('/', validateWithZod(imageQuerySchema), getAllImages);
router.get('/entity/:entityType/:entityId', getImagesByEntity);
router.get('/:id', getImageById);

// Update routes
router.put('/:id', validateWithZod(updateImageSchema), updateImage);

// Reference management
router.post(
  '/:id/reference',
  validateWithZod(addReferenceSchema),
  addReference
);
router.delete(
  '/:id/reference',
  validateWithZod(removeReferenceSchema),
  removeReference
);

// Transformation
router.post(
  '/:id/transform',
  validateWithZod(transformImageSchema),
  transformImage
);

// Admin only routes
router.delete('/:id', authorize('admin'), deleteImage);
router.post('/cleanup', authorize('admin'), cleanupUnused);

export default router;
