const { Router } = require("express");
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getDashboardStats,
} = require("../controllers/user.controller");

const { 
  authMiddleware, 
  requireAdmin,
  requireUserManagement,
  requireOwnershipOrAdmin 
} = require("../middleware");

const router = Router();

router.get("/dashboard/stats", authMiddleware, requireAdmin, getDashboardStats);

// User management routes (Admin only)
router.get("/", authMiddleware, requireAdmin, getAllUsers);
router.get("/:userId", authMiddleware, requireOwnershipOrAdmin('userId'), getUserById);

// User modification routes (Admin with user management permission)
router.put("/:userId/role", authMiddleware, requireUserManagement, updateUserRole);
router.put("/:userId/status", authMiddleware, requireUserManagement, updateUserStatus);
router.delete("/:userId", authMiddleware, requireUserManagement, deleteUser);

module.exports = router;