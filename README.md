# 🚀 ResolveIt - Dispute Resolution Platform

A comprehensive full-stack web application for managing dispute resolution cases with real-time updates, file management, administrative oversight, and advanced user management capabilities.

## 📋 Features

### 🔐 Authentication & User Management
- **User Registration & Login** with JWT authentication
- **Role-based Access Control** (User/Admin)
- **Email Verification** (production mode)
- **Password Reset** functionality with forgot/reset password
- **Profile Management** - Update personal information and change password
- **Default Admin Account** auto-created on startup
- **User Profile Pages** - Dedicated profile management for both users and admins

### 📝 Case Management
- **Multi-step Case Creation** with file uploads and evidence management
- **Case Lifecycle Tracking** with comprehensive status updates
- **Witness Management** for case documentation
- **File Upload System** with local storage and multiple file type support
- **Timeline Tracking** for case progress
- **Case Editing** - Users can edit their submitted cases
- **Case Deletion** - Users can delete their own cases
- **Evidence Upload** - Support for images, videos, audio, and documents

### 🎛️ Admin Dashboard
- **Comprehensive Analytics** and statistics with real-time data
- **Case Management** with advanced filtering and search capabilities
- **User Management** - View, update roles, and delete users
- **Panel Assignment** - Assign mediation panels with flexible validation
- **Bulk Operations** for case status updates
- **Real-time Updates** via Socket.IO
- **Advanced Search & Filter** - Search cases by title, description, status
- **Case Status Management** - Update case status with resolution details

### 📊 User Dashboard
- **Personal Case Overview** with statistics and progress tracking
- **Case Creation** and management with multi-step forms
- **File Upload** and management with drag-and-drop support
- **Case Editing** - Edit existing cases with full form support
- **Case Deletion** - Remove cases with confirmation
- **Real-time Notifications** and status updates
- **Profile Management** - Update personal information and change password

### 👥 Admin Profile & User Management
- **Admin Profile Page** - Dedicated admin profile management
- **User Management System** - Complete user administration
- **Get All Users** - View all system users with search and filtering
- **Get User Details** - Detailed user information display
- **Update User Role** - Toggle between user and admin roles
- **Delete User** - Remove users from system with confirmation
- **User Search & Filter** - Search users by name/email, filter by role
- **System Statistics** - Real-time user counts and role distribution
- **Profile Management** - Admin can update their own profile and password

### 🎨 Advanced UI Features
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Modern UI Components** - Shadcn UI with Radix UI primitives
- **Consistent Design System** - Unified styling across all components
- **Loading States** - Professional loading indicators and skeleton screens
- **Toast Notifications** - User-friendly success and error messages
- **Modal Dialogs** - Confirmation dialogs and form modals
- **Tab Navigation** - Organized content with tabbed interfaces
- **Sidebar Layouts** - Professional sidebar navigation for complex forms

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with bcrypt password hashing
- **Socket.IO** for real-time updates
- **Multer** for file uploads with validation
- **Nodemailer** for email notifications
- **Helmet** for security headers
- **Rate Limiting** and CORS protection
- **Express Validator** for input validation and sanitization

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Shadcn UI** with Radix UI primitives
- **Tailwind CSS** for utility-first styling
- **React Hook Form** with Zod validation
- **TanStack Query** for data fetching and caching
- **React Router DOM** for client-side navigation
- **Lucide React** for beautiful icons
- **React Context** for state management

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud)
- **npm** or **yarn** package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd bridge-resolve-flow
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# See backend/.env.example for all required variables

# Start the server
npm run dev
```

**Default Admin Account** (auto-created on first startup):
- **Email**: admin@resolveit.com
- **Password**: admin123

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start the development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
bridge-resolve-flow/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/      # API controllers
│   │   ├── middleware/       # Auth & validation middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── utils/           # File upload utilities
│   │   └── server.js        # Main server file
│   ├── uploads/             # File storage directory
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Admin/       # Admin dashboard components
│   │   │   ├── Auth/        # Authentication components
│   │   │   ├── Case/        # Case management components
│   │   │   ├── Dashboard/   # User dashboard components
│   │   │   ├── Profile/     # Profile management components
│   │   │   └── ui/          # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript interfaces
│   │   └── main.tsx         # App entry point
│   └── package.json
├── ResolveIt_API_Collection.json  # Postman collection
├── API_Documentation.md           # API documentation
└── README.md
```

## 🔧 Environment Configuration

### Backend (.env)
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/resolveit

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:8080

# Email Configuration (Optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,video/mp4,video/avi,video/mov,audio/mpeg,audio/wav,audio/mp3,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Environment
VITE_NODE_ENV=development
```

## 🔐 Authentication Flow

### User Registration
1. **Register** with email, password, and basic info
2. **Auto-verification** in development mode
3. **Email verification** required in production
4. **Auto-login** after successful registration

### User Login
1. **Enter credentials** (email/password)
2. **JWT token** generated and stored
3. **Role-based access** to features
4. **Session management** with localStorage

### Profile Management
1. **User Profile** - Update personal information and change password
2. **Admin Profile** - Advanced admin profile with user management
3. **Password Management** - Secure password change with validation
4. **Profile Overview** - Display user information and statistics

### Default Admin Account
- **Auto-created** on server startup
- **Email**: admin@resolveit.com
- **Password**: admin123
- **Full admin privileges** including user management

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/logout` - User logout

### Cases
- `POST /api/cases` - Create new case
- `GET /api/cases` - Get user cases
- `GET /api/cases/:id` - Get case details
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case
- `POST /api/cases/:id/files` - Upload files
- `POST /api/cases/:id/witnesses` - Add witness
- `DELETE /api/cases/:id/witnesses/:witnessId` - Remove witness

### Admin
- `GET /api/admin/dashboard` - Admin statistics
- `GET /api/admin/cases` - All cases with filtering
- `GET /api/admin/users` - All users with search and filtering
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/cases/:id/status` - Update case status
- `POST /api/admin/cases/:id/panel` - Assign mediation panel
- `PUT /api/admin/cases/bulk-status` - Bulk status update

## 🎯 Key Features

### Case Lifecycle Management
1. **Pending Verification** - New case submitted
2. **Verified** - Admin verified the case
3. **Awaiting Response** - Waiting for opposite party
4. **Accepted/Rejected** - Party response received
5. **Panel Created** - Mediation panel assigned
6. **Mediation in Progress** - Active mediation
7. **Resolved/Unresolved** - Final outcome

### User Management System
- **User Registration** - Complete user onboarding
- **Role Management** - Toggle between user and admin roles
- **User Search** - Search users by name or email
- **User Filtering** - Filter by role (All/Users/Admins)
- **User Deletion** - Remove users with confirmation
- **Profile Management** - Update personal information
- **Password Management** - Secure password changes

### File Management
- **Multiple file types** (images, videos, audio, documents)
- **Local storage** with organized directory structure
- **File size validation** and type checking
- **Secure file serving** with authentication
- **Drag-and-drop upload** interface
- **File preview** and management

### Real-time Features
- **Socket.IO integration** for live updates
- **Case status notifications**
- **Admin dashboard updates**
- **User notification system**
- **Real-time statistics**

### Advanced UI/UX
- **Responsive Design** - Works on all device sizes
- **Modern Components** - Professional UI components
- **Loading States** - Smooth loading experiences
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Success and error feedback
- **Modal Dialogs** - Confirmation and form dialogs
- **Tab Navigation** - Organized content structure
- **Sidebar Layouts** - Professional navigation

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password hashing** with bcrypt
- **Input validation** and sanitization
- **Rate limiting** to prevent abuse
- **CORS protection** for cross-origin requests
- **Helmet security headers**
- **File upload validation**
- **Role-based access control**
- **Session management**

## 📚 Documentation

### API Documentation
- **Complete API Reference** - All endpoints documented
- **Request/Response Examples** - Detailed examples for each endpoint
- **Error Handling** - Comprehensive error response documentation
- **Authentication** - JWT token usage and management
- **Data Models** - Complete schema documentation

### Postman Collection
- **ResolveIt_API_Collection.json** - Complete Postman collection
- **Environment Variables** - Pre-configured environment
- **Test Scripts** - Automated token extraction and validation
- **Request Examples** - Ready-to-use API requests

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Configure MongoDB connection
3. Set up email service (SMTP)
4. Configure file storage
5. Set secure JWT secret
6. Configure CORS for production domain

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to static hosting (Vercel, Netlify, etc.)
3. Configure environment variables
4. Set up API URL for production
5. Configure CORS on backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints
- Consult the Postman collection for API testing