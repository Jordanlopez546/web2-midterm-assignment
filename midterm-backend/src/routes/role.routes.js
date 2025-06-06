const { Router } = require("express");
const {
  getAllRoles,
  getAllRolesDetailed,
  getRoleById,
  updateRole,
  createRole,
  getAvailablePermissions,
  deleteRole,
  getRoleStatistics
} = require("../controllers/role.controller");

const { 
  authMiddleware, 
  requireAdmin,
  requireRoleManagement 
} = require("../middleware");

const router = Router();

router.get("/", getAllRoles);

// Admin routes for role management
router.get("/admin", authMiddleware, requireAdmin, getAllRolesDetailed);
router.get("/admin/statistics", authMiddleware, requireAdmin, getRoleStatistics);
router.get("/admin/:roleId", authMiddleware, requireAdmin, getRoleById);
router.get("/admin/:roleId/permissions", authMiddleware, requireAdmin, getAvailablePermissions);

// Role modification routes (Admin with role management permission)
router.post("/admin", authMiddleware, requireRoleManagement, createRole);
router.put("/admin/:roleId", authMiddleware, requireRoleManagement, updateRole);
router.delete("/admin/:roleId", authMiddleware, requireRoleManagement, deleteRole);

module.exports = router;