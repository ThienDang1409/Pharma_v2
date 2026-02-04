import { Router } from 'express';
import * as blogController from './blog.controller';
import { CreateBlogSchema, UpdateBlogSchema, BlogQuerySchema } from '../../common/validators/blog.validator';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import { validateWithZod } from '../../common/middleware/zod-validate.middleware';

const router = Router();

// Public routes
router.get('/', validateWithZod(BlogQuerySchema, 'query'), blogController.getAllBlogs);
router.get('/slug/:slug', blogController.getBlogBySlug);
router.get('/:id', blogController.getBlogById);

// Protected routes (Admin only)
router.post(
    '/', 
    authenticate, 
    authorize('admin'), 
    validateWithZod(CreateBlogSchema), 
    blogController.createBlog
);
router.put(
    '/:id', 
    authenticate, 
    authorize('admin'), 
    validateWithZod(UpdateBlogSchema),
     blogController.updateBlog
    );
router.delete(
    '/:id', 
    authenticate, 
    authorize('admin'), 
    blogController.deleteBlog
);

export default router;
