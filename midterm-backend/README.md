# Web 2 Midterm - Dynamic Role-Based Authentication & Authorization System

A comprehensive MEAN stack backend application featuring dynamic role-based authentication, authorization, and user management capabilities.

## 🌟 Features

### Core Authentication

- **JWT-based Authentication** with secure token generation
- **Password Security** using bcrypt with salt rounds
- **User Registration & Login** with role assignment
- **Profile Management** with update capabilities
- **Password Change** functionality

### Authorization System

- **Role-Based Access Control** (RBAC) with three default roles
- **Permission-Based Authorization** for granular access control
- **Dynamic Role Assignment** by administrators
- **Middleware Protection** for secure route access
- **Ownership Verification** for user resource access

### User Management

- **Complete User CRUD** operations for administrators
- **User Status Management** (activate/deactivate)
- **Advanced Search & Filtering** with pagination
- **Dashboard Statistics** and analytics

### Role Management

- **Dynamic Role Creation** and modification
- **Permission Management** system
- **Role Usage Statistics** and analytics
- **Flexible Permission Assignment**
- **Role Hierarchy** management

## 🏗️ Project Structure

```
src/
├── controllers/
│   ├── auth.controller.js      # Authentication logic
│   ├── user.controller.js      # User management logic
│   ├── role.controller.js      # Role management logic
│   └── index.js               # Controllers export
├── middleware/
│   ├── auth-middleware.js     # JWT authentication
│   ├── role-auth.js          # Role authorization
│   └── index.js              # Middleware export
├── models/
│   ├── User.js               # User model with bcrypt
│   ├── Role.js               # Role model with permissions
│   └── index.js              # Models export
├── routes/
│   ├── auth.routes.js        # Authentication routes
│   ├── user.routes.js        # User management routes
│   ├── role.routes.js        # Role management routes
│   ├── index.js              # Routes combination
└── server.js                 # Application entry point
```

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## 🚀 Installation

### 1. Clone and Setup

```bash
git clone https://github.com/Jordanlopez546/web2-midterm-backend.git
cd into it
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/web2-midterm
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### 3. Start MongoDB

```bash
# Using MongoDB service (macOS)
brew services start mongodb/brew/mongodb-community

# Using mongod directly
mongod --dbpath /usr/local/var/mongodb

# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Start the Application

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

**Expected startup output:**

```
✅ Connected to MongoDB
✅ Default roles seeded successfully
✅ Default test users seeded successfully
📧 Test Users Created:
   👨‍💼 Admin: admin@example.com / admin123
   ✏️  Editor: editor@example.com / editor123
   👁️  Viewer: viewer@example.com / viewer123
🚀 Web 2 Midterm Server is running on port 5000
📍 Server URL: http://localhost:5000
🧪 Ready for testing with pre-created accounts!
```

## 👥 Pre-created Test Users

The application automatically creates test user accounts when starting for the first time. These accounts are ready for immediate testing:

### 🔐 Login Credentials

#### 👨‍💼 Admin User

- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: ADMIN
- **Capabilities**: Full system access, user management, role management

#### ✏️ Editor User  

- **Email**: `editor@example.com`
- **Password**: `editor123`
- **Role**: EDITOR
- **Capabilities**: Content CRUD operations, profile management

#### 👁️ Viewer User

- **Email**: `viewer@example.com`
- **Password**: `viewer123`
- **Role**: VIEWER
- **Capabilities**: Read-only access, profile management

### System Roles

The application automatically seeds three default roles:

#### ADMIN

- **Permissions**: `create`, `read`, `update`, `delete`, `manage_users`, `manage_roles`
- **Description**: Full system access with user and role management
- **Capabilities**: Everything in the system

#### EDITOR

- **Permissions**: `create`, `read`, `update`, `delete`
- **Description**: Content management capabilities
- **Capabilities**: CRUD operations on content

#### VIEWER

- **Permissions**: `read`
- **Description**: Read-only access
- **Capabilities**: View content only

**Note**: Both roles and test users are automatically created when the server starts for the first time. No manual setup required!

## 🚀 Quick Start Testing

Once the server is running, you can immediately test the system:

1. **Start the server**: `npm run dev`
2. **Login immediately**: Use any of the pre-created accounts above
3. **Test role-based access**: Try different endpoints with different user roles

**Example quick test:**

```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Use the returned token to access admin routes
curl -X GET http://localhost:5000/api/users/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📚 API Documentation

### Base URL: `http://localhost:5000/api`

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| GET | `/auth/me` | Get current user profile | Private |
| PUT | `/auth/me` | Update user profile | Private |
| PUT | `/auth/change-password` | Change password | Private |

### User Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/users` | Get all users (paginated) | Admin |
| GET | `/users/:userId` | Get specific user | Admin/Owner |
| PUT | `/users/:userId/role` | Update user role | Admin |
| PUT | `/users/:userId/status` | Activate/deactivate user | Admin |
| DELETE | `/users/:userId` | Delete user | Admin |
| GET | `/users/dashboard/stats` | Get dashboard statistics | Admin |

### Role Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/roles` | Get all roles (public) | Public |
| GET | `/roles/admin` | Get detailed roles | Admin |
| GET | `/roles/admin/:roleId` | Get specific role details | Admin |
| POST | `/roles/admin` | Create new role | Admin |
| PUT | `/roles/admin/:roleId` | Update role | Admin |
| DELETE | `/roles/admin/:roleId` | Delete role | Admin |
| GET | `/roles/admin/statistics` | Get role statistics | Admin |
| GET | `/roles/admin/:roleId/permissions` | Get available permissions | Admin |

## 🧪 Testing the API

### 1. Login with Pre-created Admin User

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "userId": "...",
      "fullName": "System Administrator",
      "email": "admin@example.com",
      "role": {
        "roleId": "...",
        "name": "ADMIN",
        "description": "Full system access with user management capabilities",
        "permissions": ["create", "read", "update", "delete", "manage_users", "manage_roles"]
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Test Different User Roles

```bash
# Login as Editor
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "editor@example.com",
  "password": "editor123"
}

# Login as Viewer
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "viewer@example.com",
  "password": "viewer123"
}
```

### 3. Test Protected Routes

```bash
# Get your profile (any authenticated user)
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN

# Get all users (admin only)
GET http://localhost:5000/api/users
Authorization: Bearer YOUR_ADMIN_TOKEN

# Get dashboard statistics (admin only)
GET http://localhost:5000/api/users/dashboard/stats
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### 4. Test User Management (Admin Only)

```bash
# Get dashboard statistics
GET http://localhost:5000/api/users/dashboard/stats
Authorization: Bearer YOUR_ADMIN_TOKEN

# Update user role (change editor to admin)
PUT http://localhost:5000/api/users/:userId/role
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "roleName": "ADMIN"
}

# Get all users with filtering
GET http://localhost:5000/api/users?role=EDITOR&page=1&limit=5
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### 5. Test Role Management (Admin Only)

```bash
# Get all roles with detailed information
GET http://localhost:5000/api/roles/admin
Authorization: Bearer YOUR_ADMIN_TOKEN

# Update role permissions
PUT http://localhost:5000/api/roles/admin/:roleId
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "description": "Updated role description",
  "permissions": ["read", "create", "update"]
}

# Get role usage statistics
GET http://localhost:5000/api/roles/admin/statistics
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### 6. Test Authorization Levels

```bash
# Test viewer access (should work for all roles)
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_VIEWER_TOKEN

# Test editor access (should fail for viewer)
GET http://localhost:5000/api/users
Authorization: Bearer YOUR_VIEWER_TOKEN
# Expected: 403 Forbidden

# Test admin access (should fail for editor and viewer)
GET http://localhost:5000/api/users/dashboard/stats
Authorization: Bearer YOUR_EDITOR_TOKEN
# Expected: 403 Forbidden
```

## 🔒 Security Features

### Authentication Security

- **JWT Tokens** with configurable expiration
- **bcrypt Password Hashing** with salt rounds of 12
- **Password Validation** with minimum length requirements
- **Account Status Verification** during login

### Authorization Security

- **Role-Based Access Control** with inheritance
- **Permission-Based Authorization** for granular control
- **Ownership Verification** for resource access
- **Admin Self-Protection** (can't modify own role/status)

### Input Validation

- **Request Validation** with proper error handling
- **Email Format Validation** with regex patterns
- **MongoDB Injection Protection** through Mongoose
- **Type Validation** for all input parameters

## 📊 Monitoring & Analytics

### Dashboard Statistics

- **User Count** by role and status
- **Registration Trends** over time
- **Role Distribution** analytics
- **Activity Monitoring** with last login tracking

## 🛠 Development Scripts

```bash
# Start development server with auto-restart
npm run dev

# Start production server
npm start

# Install dependencies
npm install

# Check for updates
npm outdated
```

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `5000` | No |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/web2-midterm` | Yes |
| `JWT_SECRET` | JWT signing secret | None | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` | No |
| `NODE_ENV` | Environment mode | `development` | No |

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Errors

```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Check connection string in .env
MONGO_URI=mongodb://localhost:27017/web2-midterm
```

#### JWT Token Issues

```bash
# Verify JWT_SECRET is set
echo $JWT_SECRET

# Check token format in requests
Authorization: Bearer <your-token-here>
```

#### Permission Denied Errors

- Verify user has correct role/permissions
- Check if user account is active
- Ensure proper middleware order in routes

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and request logging.

## 📈 Performance Considerations

### Database Optimization

- **Indexed Fields** on email and role for faster queries
- **Pagination** implemented for large datasets
- **Aggregation Pipelines** for complex statistics
- **Connection Pooling** through Mongoose

### Security Optimization

- **Password Select** disabled by default
- **Token Expiration** to limit session lifetime
- **CORS Configuration** for frontend integration

## 👨‍💻 Author

Jordan C. Nwabuike
University of The Gambia  
Internet and Web Programming II - Midterm Assignment

## 📄 License

This project is for educational purposes as part of the Web Programming II course at the University of The Gambia.

---
