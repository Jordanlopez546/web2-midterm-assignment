const { Role, User } = require("../models");

const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find()
      .select('name description')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      message: 'Roles retrieved successfully',
      data: {
        roles: roles.map(role => ({
          roleId: role._id,
          name: role.name,
          description: role.description,
        }))
      }
    });

  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching roles'
    });
  }
};

const getAllRolesDetailed = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: 1 });

    // Get user count for each role
    const rolesWithUserCount = await Promise.all(
      roles.map(async (role) => {
        const userCount = await User.countDocuments({ role: role._id });
        const activeUserCount = await User.countDocuments({ 
          role: role._id, 
          isActive: true 
        });
        
        return {
          roleId: role._id,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          userCount,
          activeUserCount,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt
        };
      })
    );

    res.json({
      success: true,
      message: 'Detailed roles retrieved successfully',
      data: { 
        roles: rolesWithUserCount 
      }
    });

  } catch (error) {
    console.error('Get detailed roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching detailed roles'
    });
  }
};

const getRoleById = async (req, res) => {
  try {
    const { roleId } = req.params;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Get users with this role
    const users = await User.find({ role: roleId })
      .select('fullName email isActive createdAt lastLogin')
      .sort({ createdAt: -1 });

    // Get statistics for this role
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;

    res.json({
      success: true,
      message: 'Role details retrieved successfully',
      data: {
        role: {
          roleId: role._id,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt
        },
        statistics: {
          totalUsers,
          activeUsers,
          inactiveUsers
        },
        users: users.map(user => ({
          userId: user._id,
          fullName: user.fullName,
          email: user.email,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          memberSince: user.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Get role details error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching role details'
    });
  }
};

const updateRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { description, permissions } = req.body;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Validate permissions if provided
    const validPermissions = [
      'create', 'read', 'update', 'delete', 
      'manage_users', 'manage_roles'
    ];

    if (permissions && Array.isArray(permissions)) {
      const invalidPermissions = permissions.filter(
        perm => !validPermissions.includes(perm)
      );
      
      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
          validPermissions
        });
      }
    }

    // Update fields if provided
    if (description !== undefined) {
      role.description = description.trim();
    }
    
    if (permissions !== undefined) {
      role.permissions = permissions;
    }

    await role.save();

    // Get user count for updated role
    const userCount = await User.countDocuments({ role: roleId });

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: {
        role: {
          roleId: role._id,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          userCount,
          updatedAt: role.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update role error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating role'
    });
  }
};

const createRole = async (req, res) => {
  try {
    const { name, description, permissions = [] } = req.body;

    // Validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      });
    }

    // Check if role already exists
    const existingRole = await Role.findOne({ name: name.toUpperCase() });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role with this name already exists'
      });
    }

    // Validate permissions
    const validPermissions = [
      'create', 'read', 'update', 'delete', 
      'manage_users', 'manage_roles'
    ];

    if (permissions && Array.isArray(permissions)) {
      const invalidPermissions = permissions.filter(
        perm => !validPermissions.includes(perm)
      );
      
      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
          validPermissions
        });
      }
    }

    // Create new role
    const newRole = new Role({
      name: name.toUpperCase().trim(),
      description: description.trim(),
      permissions
    });

    await newRole.save();

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: {
        role: {
          roleId: newRole._id,
          name: newRole.name,
          description: newRole.description,
          permissions: newRole.permissions,
          userCount: 0,
          createdAt: newRole.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Create role error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating role'
    });
  }
};

const getAvailablePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;

    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      message: 'Available permissions retrieved successfully',
      data: {
        role: {
          roleId: role._id,
          name: role.name,
        },
        currentPermissions: role.permissions
      }
    });

  } catch (error) {
    console.error('Get permissions error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching permissions'
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Prevent deletion of default roles
    const defaultRoles = ['ADMIN', 'EDITOR', 'VIEWER'];
    if (defaultRoles.includes(role.name)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default system roles'
      });
    }

    // Check if any users are assigned to this role
    const userCount = await User.countDocuments({ role: roleId });
    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. ${userCount} user(s) are assigned to this role.`,
        data: { userCount }
      });
    }

    // Delete the role
    await Role.findByIdAndDelete(roleId);

    res.json({
      success: true,
      message: 'Role deleted successfully',
      data: {
        deletedRole: {
          roleId: role._id,
          name: role.name,
          deletedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Delete role error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting role'
    });
  }
};

const getRoleStatistics = async (req, res) => {
  try {
    // Get all roles with user counts
    const roleStats = await Role.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'role',
          as: 'users'
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          permissions: 1,
          totalUsers: { $size: '$users' },
          activeUsers: {
            $size: {
              $filter: {
                input: '$users',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          },
          createdAt: 1
        }
      },
      { $sort: { createdAt: 1 } }
    ]);

    // Calculate totals
    const totalRoles = roleStats.length;
    const totalUsers = roleStats.reduce((sum, role) => sum + role.totalUsers, 0);
    const totalActiveUsers = roleStats.reduce((sum, role) => sum + role.activeUsers, 0);

    res.json({
      success: true,
      message: 'Role statistics retrieved successfully',
      data: {
        overview: {
          totalRoles,
          totalUsers,
          totalActiveUsers,
          totalInactiveUsers: totalUsers - totalActiveUsers
        },
        roleDistribution: roleStats.map(role => ({
          roleId: role._id,
          name: role.name,
          description: role.description,
          permissionCount: role.permissions.length,
          totalUsers: role.totalUsers,
          activeUsers: role.activeUsers,
          inactiveUsers: role.totalUsers - role.activeUsers,
          usagePercentage: totalUsers > 0 ? ((role.totalUsers / totalUsers) * 100).toFixed(1) : 0
        }))
      }
    });

  } catch (error) {
    console.error('Get role statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching role statistics'
    });
  }
};

module.exports = {
  getAllRoles,
  getAllRolesDetailed,
  getRoleById,
  updateRole,
  createRole,
  getAvailablePermissions,
  deleteRole,
  getRoleStatistics
};