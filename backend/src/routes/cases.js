import express from 'express';
import {
  createCase,
  getUserCases,
  getCase,
  updateCase,
  updateCaseStatus,
  uploadFiles,
  addWitness,
  removeWitness,
  assignPanel,
  deleteCase
} from '../controllers/caseController.js';
import {
  validateCaseCreation,
  validateCaseUpdate,
  validateWitness,
  validatePanelMember,
  validatePanelAssignment,
  sanitizeInput
} from '../middleware/validation.js';
import { authenticate, authorizeUser, authorizeAdmin } from '../middleware/auth.js';
import { uploadMultiple, handleFileUploadError } from '../utils/fileUpload.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Case CRUD operations
router.post('/', sanitizeInput, validateCaseCreation, createCase);
router.get('/', getUserCases);
router.get('/:id', getCase);
router.put('/:id', sanitizeInput, validateCaseUpdate, updateCase);
router.delete('/:id', deleteCase);

// File upload
router.post('/:id/files', uploadMultiple, handleFileUploadError, uploadFiles);

// Witness management
router.post('/:id/witnesses', sanitizeInput, validateWitness, addWitness);
router.delete('/:id/witnesses/:witnessId', removeWitness);

// Admin-only routes
router.put('/:id/status', authorizeAdmin, sanitizeInput, validateCaseUpdate, updateCaseStatus);
router.post('/:id/panel', authorizeAdmin, sanitizeInput, validatePanelAssignment, assignPanel);

export default router; 