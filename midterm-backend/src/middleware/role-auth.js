// To see if a user has one of the required roles
const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      if (!req.user.role) {
        return res.status(403).json({
          success: false,
          message: 'User role not found'
        });
      }

      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      const userRole = req.user.role.name;
      const hasRequired = roles.includes(userRole);

      if (!hasRequired) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${userRole}`
        });
      }

      next()
    } catch (error) {
      console.error('Role authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Role authorization failed'
      });
    }
  }
}

// To see if a user has some specific permission
const requirePermission = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      if (!req.user.role || !req.user.role.permissions) {
        return res.status(403).json({
          success: false,
          message: 'User role or permissions not found'
        });
      }

      const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

      const userPermissions = req.user.role.permissions;
      const hasAllPermissions = permissions.every(permission => userPermissions.includes(permission));

      if (!hasAllPermissions) {
        const missingPermissions = permissions.filter(permission => !userPermissions.includes(permission));

        return res.status(403).json({
          success: false,
          message: `Access denied. Missing permissions: ${missingPermissions.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization failed'
      });
    }
  }
}

// Check if user is admin
const requireAdmin = requireRole('ADMIN');

// Check if user is admin or editor
const requireEditor = requireRole(['ADMIN', 'EDITOR']);

// check if user can manage users (admin only)
const requireUserManagement = requirePermission('manage_users');

//  Check if user can manage roles (admin only)
const requireRoleManagement = requirePermission('manage_roles');

// Check if user owns the resource or is admin
const requireOwnershipOrAdmin = (userIdParam = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const resourceUserId = req.params[userIdParam];
      const currentUserId = req.user._id.toString();
      const isAdmin = req.user.role.name === 'ADMIN';

      if (currentUserId === resourceUserId || isAdmin) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources'
      });
    } catch (error) {
      console.error('Ownership authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization failed'
      });
    }
  }
}

module.exports = {
  requireRole,
  requirePermission,
  requireAdmin,
  requireEditor,
  requireUserManagement,
  requireRoleManagement,
  requireOwnershipOrAdmin
}