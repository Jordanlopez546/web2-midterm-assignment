const { 
  requireAdmin, 
  requireEditor, 
  requireOwnershipOrAdmin, 
  requirePermission, 
  requireRole, 
  requireRoleManagement, 
  requireUserManagement } = require('./role-auth')
const { authMiddleware } = require('./auth-middleware')

module.exports = {
  authMiddleware,
  requireRole,
  requirePermission,
  requireAdmin,
  requireEditor,
  requireUserManagement,
  requireRoleManagement,
  requireOwnershipOrAdmin
}