const { Role, User } = require("../models");
const jwt = require('jsonwebtoken');
const { sanitizeUser } = require("./user.controller");

require('dotenv').config();

const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, roleName } = req.body;

    // Validation
    if (!fullName || !email || !password || !roleName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: fullName, email, password, roleName'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Find and validate role
    const role = await Role.findOne({ name: roleName.toUpperCase() });
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Available roles: ADMIN, EDITOR, VIEWER'
      });
    }

    // Create new user
    const newUser = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role._id,
    });

    await newUser.save();

    // Get user with populated role for response
    const userWithRole = await User.findById(newUser._id)
      .populate('role', 'name description permissions')
      .select('-password');

    // Generate token
    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: sanitizeUser(userWithRole),
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle validation errors
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
      message: 'Server error during registration'
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user with password included and role populated
    const user = await User.findOne({ email: email.toLowerCase() })
      .populate('role', 'name description permissions')
      .select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login timestamp
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: sanitizeUser(user),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'User profile fetched successfully',
      data: {
        user: sanitizeUser(req.user)
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

const updateCurrentUser = async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const userId = req.user._id;

    // Build update object
    const updateData = {};
    if (fullName) updateData.fullName = fullName.trim();
    if (email) updateData.email = email.toLowerCase().trim();

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).populate('role', 'name description permissions');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: sanitizeUser(updatedUser)
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);

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
      message: 'Server error while updating profile'
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(userId).select('+password');
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateCurrentUser,
  changePassword,
};