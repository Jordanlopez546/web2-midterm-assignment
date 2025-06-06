# Web 2 Midterm - Dynamic Role-Based Authentication Frontend

A comprehensive Angular 19 frontend application featuring dynamic role-based authentication, authorization, and user management system that works with the MEAN stack backend.

## 🌟 Features

### Core Features

- **JWT Authentication** with secure token storage
- **Role-Based Access Control** (RBAC) with three default roles
- **Protected Routes** with Angular Guards
- **Responsive Design** with Bootstrap 5
- **Real-time Form Validation**
- **HTTP Interceptors** for automatic token injection
- **User-friendly Interface** with intuitive navigation

### User Features

- **User Registration** with role selection
- **User Login** with JWT token management
- **Profile Management** with update capabilities
- **Password Change** functionality
- **Role-based Navigation** showing/hiding features based on permissions

### Admin Features

- **User Management Dashboard** with statistics
- **User CRUD Operations** (Create, Read, Update, Delete)  
- **Dynamic Role Assignment** for users
- **User Status Management** (activate/deactivate)
- **Advanced Search & Filtering** with pagination
- **Role Management** with permission configuration
- **Dashboard Analytics** with user statistics

## 🛠️ Technology Stack

- **Angular 19** - Frontend framework
- **TypeScript** - Programming language
- **Bootstrap 5.3** - CSS framework
- **Font Awesome** - Icon library
- **RxJS** - Reactive programming
- **Angular Router** - Navigation
- **Angular Forms** - Form handling
- **Angular HTTP Client** - API communication

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Angular CLI** (v19)
- **npm** or **yarn** package manager
- **Backend API** running on port 0101

## 🚀 Installation

### 1. Install Angular CLI (if not already installed)

```bash
npm install -g @angular/cli@latest
```

### 2. Clone the Repository

```bash
git clone https://github.com/Jordanlopez546/web2-midterm-frontend.git

cd midterm-app-ui

npm install

# Bootstrap and Font Awesome (if not already installed)
npm install bootstrap@5.3.0
npm install @fortawesome/fontawesome-free

# Zone.js (required for Angular)
npm install zone.js


# In your backend directory
npm run dev

# Verify the environment configuration (environment.ts)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:0101/api'
};

# Then to run the angular app
ng serve
