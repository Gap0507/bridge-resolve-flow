import express from 'express';
import {
  getDashboardStats,
  getAllCases,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  deleteUser,
  bulkUpdateCaseStatus,
  getSystemAnalytics
} from '../controllers/adminController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { sanitizeInput } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorizeAdmin);

// Dashboard and analytics
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getSystemAnalytics);

// Case management
router.get('/cases', getAllCases);
router.put('/cases/bulk-status', sanitizeInput, bulkUpdateCaseStatus);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/role', sanitizeInput, updateUserRole);
router.delete('/users/:id', deleteUser);

export default router; 