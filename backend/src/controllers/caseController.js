import Case from '../models/Case.js';
import User from '../models/User.js';
import { processUploadedFile } from '../utils/fileUpload.js';

// @desc    Create new case
// @route   POST /api/cases
// @access  Private
export const createCase = async (req, res) => {
  try {
    const {
      caseType,
      title,
      description,
      oppositePartyName,
      oppositePartyEmail,
      oppositePartyPhone,
      oppositePartyAddress,
      isPendingInCourt,
      firNumber,
      courtName,
      policeStation,
      witnesses
    } = req.body;

    // Create case
    const newCase = await Case.create({
      userId: req.user._id,
      caseType,
      title,
      description,
      oppositePartyName,
      oppositePartyEmail,
      oppositePartyPhone,
      oppositePartyAddress,
      isPendingInCourt,
      firNumber,
      courtName,
      policeStation,
      witnesses: witnesses || []
    });

    // Add initial timeline event
    await newCase.addTimelineEvent(
      'Case Submitted',
      'Case has been submitted for verification',
      'Pending Verification',
      req.user.name
    );

    // Populate user details
    await newCase.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      data: {
        case: newCase
      }
    });
  } catch (error) {
    console.error('Create case error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create case',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get all cases for current user
// @route   GET /api/cases
// @access  Private
export const getUserCases = async (req, res) => {
  try {
    const { status, caseType, page = 1, limit = 10 } = req.query;
    
    const query = { userId: req.user._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (caseType && caseType !== 'all') {
      query.caseType = caseType;
    }

    const skip = (page - 1) * limit;
    
    const cases = await Case.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Case.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        cases,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user cases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cases',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get single case
// @route   GET /api/cases/:id
// @access  Private
export const getCase = async (req, res) => {
  try {
    const case_ = await Case.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('resolvedBy', 'name');

    if (!case_) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Check if user has access to this case
    if (case_.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        case: case_
      }
    });
  } catch (error) {
    console.error('Get case error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get case',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update case
// @route   PUT /api/cases/:id
// @access  Private
export const updateCase = async (req, res) => {
  try {
    const case_ = await Case.findById(req.params.id);

    if (!case_) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Check if user has access to this case
    if (case_.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update case
    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Case updated successfully',
      data: {
        case: updatedCase
      }
    });
  } catch (error) {
    console.error('Update case error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update case',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update case status (Admin only)
// @route   PUT /api/cases/:id/status
// @access  Private (Admin)
export const updateCaseStatus = async (req, res) => {
  try {
    const { status, resolutionDetails } = req.body;

    const case_ = await Case.findById(req.params.id);

    if (!case_) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Update status
    await case_.updateStatus(status, req.user.name);

    // Add resolution details if provided
    if (resolutionDetails) {
      case_.resolutionDetails = resolutionDetails;
      if (status === 'Resolved') {
        case_.resolvedAt = new Date();
        case_.resolvedBy = req.user._id;
      }
    }

    await case_.save();

    const updatedCase = await Case.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('resolvedBy', 'name');

    res.status(200).json({
      success: true,
      message: 'Case status updated successfully',
      data: {
        case: updatedCase
      }
    });
  } catch (error) {
    console.error('Update case status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update case status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Upload files to case
// @route   POST /api/cases/:id/files
// @access  Private
export const uploadFiles = async (req, res) => {
  try {
    const case_ = await Case.findById(req.params.id);

    if (!case_) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Check if user has access to this case
    if (case_.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Process uploaded files
    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileData = processUploadedFile(file);
        if (fileData) {
          uploadedFiles.push(fileData);
        }
      }
    }

    // Add files to case
    case_.proofFiles.push(...uploadedFiles);
    await case_.save();

    // Add timeline event
    await case_.addTimelineEvent(
      'Files Uploaded',
      `${uploadedFiles.length} file(s) uploaded to the case`,
      case_.status,
      req.user.name
    );

    const updatedCase = await Case.findById(req.params.id)
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        case: updatedCase
      }
    });
  } catch (error) {
    console.error('Upload files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Add witness to case
// @route   POST /api/cases/:id/witnesses
// @access  Private
export const addWitness = async (req, res) => {
  try {
    const { name, email, phone, relationship } = req.body;

    const case_ = await Case.findById(req.params.id);

    if (!case_) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Check if user has access to this case
    if (case_.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add witness
    case_.witnesses.push({
      name,
      email,
      phone,
      relationship
    });

    await case_.save();

    // Add timeline event
    await case_.addTimelineEvent(
      'Witness Added',
      `Witness ${name} added to the case`,
      case_.status,
      req.user.name
    );

    const updatedCase = await Case.findById(req.params.id)
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Witness added successfully',
      data: {
        case: updatedCase
      }
    });
  } catch (error) {
    console.error('Add witness error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add witness',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Remove witness from case
// @route   DELETE /api/cases/:id/witnesses/:witnessId
// @access  Private
export const removeWitness = async (req, res) => {
  try {
    const { witnessId } = req.params;

    const case_ = await Case.findById(req.params.id);

    if (!case_) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Check if user has access to this case
    if (case_.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove witness
    case_.witnesses = case_.witnesses.filter(witness => witness._id.toString() !== witnessId);
    await case_.save();

    // Add timeline event
    await case_.addTimelineEvent(
      'Witness Removed',
      'A witness has been removed from the case',
      case_.status,
      req.user.name
    );

    const updatedCase = await Case.findById(req.params.id)
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Witness removed successfully',
      data: {
        case: updatedCase
      }
    });
  } catch (error) {
    console.error('Remove witness error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove witness',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Assign panel to case (Admin only)
// @route   POST /api/cases/:id/panel
// @access  Private (Admin)
export const assignPanel = async (req, res) => {
  try {
    const { members } = req.body;

    const case_ = await Case.findById(req.params.id);

    if (!case_) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Validate panel members
    if (!members || members.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Panel must have at least 3 members'
      });
    }

    // Check if panel has required roles
    const roles = members.map(member => member.role);
    const requiredRoles = ['Lawyer', 'Religious Leader', 'Community Representative'];
    
    const hasAllRoles = requiredRoles.every(role => roles.includes(role));
    if (!hasAllRoles) {
      return res.status(400).json({
        success: false,
        message: 'Panel must include a Lawyer, Religious Leader, and Community Representative'
      });
    }

    // Assign panel
    case_.assignedPanel = {
      members,
      assignedAt: new Date()
    };

    // Update status
    await case_.updateStatus('Panel Created', req.user.name);

    await case_.save();

    const updatedCase = await Case.findById(req.params.id)
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Panel assigned successfully',
      data: {
        case: updatedCase
      }
    });
  } catch (error) {
    console.error('Assign panel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign panel',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Delete case
// @route   DELETE /api/cases/:id
// @access  Private
export const deleteCase = async (req, res) => {
  try {
    const case_ = await Case.findById(req.params.id);

    if (!case_) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Check if user has access to this case
    if (case_.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only allow deletion if case is in initial state
    if (case_.status !== 'Pending Verification') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete case that has been processed'
      });
    }

    await Case.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    console.error('Delete case error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete case',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 