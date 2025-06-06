const { User, Role } = require("../models");

const sanitizeUser = (user) => {
  return {
    userId: user._id,
    fullName: user.fullName,
    email: user.email,
    role: {
      roleId: user.role._id,
      name: user.role.name,
      description: user.role.description,
      permissions: user.role.permissions
    },
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive, search } = req.query;
    
    const filter = {};
    
    // Filter by role if provided
    if (role) {
      const roleDoc = await Role.findOne({ name: role.toUpperCase() });
      if (roleDoc) {
        filter.role = roleDoc._id;
      }
    }
    
    // Filter by active status if provided
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    // Search by name or email if provided
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users with pagination
    const users = await User.find(filter)
      .populate('role', 'name description permissions')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: users.map(user => sanitizeUser(user)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('role', 'name description permissions')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: { 
        user: sanitizeUser(user) 
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleName } = req.body;

    // Validation
    if (!roleName) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required'
      });
    }

    // Find the role
    const role = await Role.findOne({ name: roleName.toUpperCase() });
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Available roles: ADMIN, EDITOR, VIEWER'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from changing their own role
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    // Update user role
    user.role = role._id;
    await user.save();

    // Get updated user with role populated
    const updatedUser = await User.findById(userId)
      .populate('role', 'name description permissions')
      .select('-password');

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { 
        user: sanitizeUser(updatedUser) 
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating user role'
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // Validation
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // Update user status
    user.isActive = isActive;
    await user.save();

    // Get updated user with role populated
    const updatedUser = await User.findById(userId)
      .populate('role', 'name description permissions')
      .select('-password');

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { 
        user: sanitizeUser(updatedUser) 
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Store user info for response
    const deletedUserInfo = {
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      deletedAt: new Date().toISOString(),
      deletedBy: req.user.fullName
    };

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUser: deletedUserInfo
      }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    // Get user count by role
    const usersByRole = await User.aggregate([
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'role'
        }
      },
      { $unwind: '$role' },
      {
        $group: {
          _id: '$role.name',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get recent registrations by day (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const registrationsByDay = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
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
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        overview: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          recentUsers
        },
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        registrationTrend: registrationsByDay
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getDashboardStats,
  sanitizeUser
};