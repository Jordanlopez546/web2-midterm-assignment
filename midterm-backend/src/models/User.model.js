const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Role = require('./Role.model');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [3, 'Full name must be at least 3 characters long'],
    maxlength: [100, 'Full name must not exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Exclude password from queries by default
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'User role is required'],
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date, 
    default: null
  }
}, {
  timestamps: true
})

userSchema.index({ role: 1 })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error)
  }
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed')
  }
}

userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save();
}

// Static method to find user with role populated
userSchema.statics.findWithRole = function(query = {}) {
  return this.findOne(query).populate('role', 'name description permissions');
};

// Static method to find all users with roles
userSchema.statics.findAllWithRoles = function(query = {}) {
  return this.find(query).populate('role', 'name description permissions');
};

userSchema.statics.seedUsers = async function() {
  try {
    const count = await this.countDocuments();
    
    if (count === 0) {
      // Get roles first
      const adminRole = await Role.findOne({ name: 'ADMIN' });
      const editorRole = await Role.findOne({ name: 'EDITOR' });
      const viewerRole = await Role.findOne({ name: 'VIEWER' });

      const defaultUsers = [
        {
          fullName: "System Administrator",
          email: "admin@example.com",
          password: "admin123", 
          role: adminRole._id,
          isActive: true
        },
        {
          fullName: "Content Editor",
          email: "editor@example.com", 
          password: "editor123",
          role: editorRole._id,
          isActive: true
        },
        {
          fullName: "Content Viewer",
          email: "viewer@example.com",
          password: "viewer123",
          role: viewerRole._id,
          isActive: true
        }
      ];

      // Create users one by one to trigger password hashing
      for (const userData of defaultUsers) {
        const user = new this(userData);
        await user.save();
      }
    }
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
  }
};

module.exports = mongoose.model('User', userSchema);