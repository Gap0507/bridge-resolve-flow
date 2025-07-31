import Case from '../models/Case.js';
import User from '../models/User.js';

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
  try {
    // Get case statistics
    const totalCases = await Case.countDocuments();
    const pendingVerification = await Case.countDocuments({ status: 'Pending Verification' });
    const awaitingResponse = await Case.countDocuments({ status: 'Awaiting Response' });
    const inProgress = await Case.countDocuments({ 
      status: { $in: ['Panel Created', 'Mediation in Progress'] } 
    });
    const resolved = await Case.countDocuments({ status: 'Resolved' });
    const unresolved = await Case.countDocuments({ status: 'Unresolved' });
    const rejected = await Case.countDocuments({ status: 'Rejected' });

    // Get user statistics
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Get recent cases
    const recentCases = await Case.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get cases by type
    const casesByType = await Case.aggregate([
      {
        $group: {
          _id: '$caseType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get cases by status
    const casesByStatus = await Case.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate resolution rate
    const resolutionRate = totalCases > 0 ? (resolved / totalCases) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCases,
          pendingVerification,
          awaitingResponse,
          inProgress,
          resolved,
          unresolved,
          rejected,
          totalUsers,
          totalAdmins,
          resolutionRate: Math.round(resolutionRate * 100) / 100
        },
        recentCases,
        casesByType,
        casesByStatus
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get all cases (Admin)
// @route   GET /api/admin/cases
// @access  Private (Admin)
export const getAllCases = async (req, res) => {
  try {
    const { 
      status, 
      caseType, 
      search, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (caseType && caseType !== 'all') {
      query.caseType = caseType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { oppositePartyName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const cases = await Case.find(query)
      .populate('userId', 'name email')
      .populate('resolvedBy', 'name')
      .sort(sort)
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
    console.error('Get all cases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cases',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const { 
      role, 
      search, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get user details (Admin)
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's cases
    const cases = await Case.find({ userId: user._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        user,
        cases
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from removing their own admin role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Check if user has active cases
    const activeCases = await Case.countDocuments({ 
      userId: user._id,
      status: { $nin: ['Resolved', 'Unresolved', 'Rejected'] }
    });

    if (activeCases > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active cases'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Bulk update case statuses (Admin)
// @route   PUT /api/admin/cases/bulk-status
// @access  Private (Admin)
export const bulkUpdateCaseStatus = async (req, res) => {
  try {
    const { caseIds, status, resolutionDetails } = req.body;

    if (!caseIds || !Array.isArray(caseIds) || caseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Case IDs are required'
      });
    }

    const updateData = { status };
    if (resolutionDetails) {
      updateData.resolutionDetails = resolutionDetails;
      if (status === 'Resolved') {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = req.user._id;
      }
    }

    const result = await Case.updateMany(
      { _id: { $in: caseIds } },
      updateData
    );

    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} cases successfully`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Bulk update case status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cases',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get system analytics (Admin)
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getSystemAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Cases created in period
    const casesCreated = await Case.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Cases resolved in period
    const casesResolved = await Case.countDocuments({
      resolvedAt: { $gte: startDate }
    });

    // Average resolution time
    const resolvedCases = await Case.find({
      resolvedAt: { $gte: startDate }
    });

    let totalResolutionTime = 0;
    resolvedCases.forEach(case_ => {
      totalResolutionTime += (case_.resolvedAt - case_.createdAt) / (1000 * 60 * 60 * 24); // days
    });

    const avgResolutionTime = resolvedCases.length > 0 
      ? totalResolutionTime / resolvedCases.length 
      : 0;

    // Cases by type in period
    const casesByType = await Case.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$caseType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Cases by status in period
    const casesByStatus = await Case.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily case creation trend
    const dailyTrend = await Case.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: parseInt(period),
        casesCreated,
        casesResolved,
        avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
        casesByType,
        casesByStatus,
        dailyTrend
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 