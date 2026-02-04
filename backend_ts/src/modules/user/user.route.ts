import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from './user.controller';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import { validateWithZod } from '../../common/middleware/zod-validate.middleware';
import { updateUserSchema, userQuerySchema } from '../../common/validators/user.validator';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, authorize('admin'));

router.get('/', validateWithZod(userQuerySchema, 'query'), getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', validateWithZod(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;
