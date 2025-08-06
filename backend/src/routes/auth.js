import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout
} from '../controllers/authController.js';
import {
  validateUserRegistration,
  validateUserLogin,
  sanitizeInput
} from '../middleware/validation.js';
import { authenticate, authorizeUser } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', sanitizeInput, validateUserRegistration, register);
router.post('/login', sanitizeInput, validateUserLogin, login);

router.post('/forgot-password', sanitizeInput, forgotPassword);
router.post('/reset-password', sanitizeInput, resetPassword);

// Protected routes
router.get('/me', authenticate, getProfile);
router.put('/profile', authenticate, sanitizeInput, updateProfile);
router.put('/change-password', authenticate, sanitizeInput, changePassword);
router.post('/logout', authenticate, logout);

export default router; 