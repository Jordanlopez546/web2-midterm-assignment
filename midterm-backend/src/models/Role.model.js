const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    uppercase: true,
    enum: {
      values: ['ADMIN', 'EDITOR', 'VIEWER'],
      message: 'Role must be either ADMIN, EDITOR, or VIEWER'
    }
  },
  description: {
    type: String, 
    required: [true, 'Role description is required'],
    trim: true,
  },
  permissions: {
    type: [String],
    default: [],
  }
}, {
  timestamps: true,
})

// To seed initial roles
roleSchema.statics.seedRoles = async function() {
  try {
    const count = await this.countDocuments();

    if (count === 0) {
      const defaultRoles = [
        {
          name: "ADMIN",
          description: 'Full system access with user management capabilities',
          permissions: ['create', 'read', 'update', 'delete', 'manage_users', 'manage_roles']
        },
        {
          name: "EDITOR",
          description: 'Can create, edit and manage content',
          permissions: ['create', 'read', 'update', 'delete']
        },
        {
          name: "VIEWER",
          description: 'Can only view content, no editing or management permissions',
          permissions: ['read']
        }
      ]

      await this.insertMany(defaultRoles);
      console.log('Default roles seeded successfully');
    }
  } catch(error) {
    console.error('Error seeding roles: ', error.message)
  }
}

roleSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission)
}

module.exports = mongoose.model("Role", roleSchema);