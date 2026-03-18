import express from 'express';
import { getUsers, updateUserRole, deleteUser, getUserRoles } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getUsers);
router.get('/roles', protect, getUserRoles);
router.patch('/:id/role', protect, updateUserRole);
router.delete('/:id', protect, deleteUser);

export default router;
