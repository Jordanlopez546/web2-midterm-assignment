const { Router } = require("express");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateCurrentUser,
  changePassword,
} = require("../controllers/auth.controller");

const { authMiddleware } = require("../middleware");

const router = Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (require authentication)
router.get("/me", authMiddleware, getCurrentUser);
router.put("/me", authMiddleware, updateCurrentUser);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;