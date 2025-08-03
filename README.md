# 🚀 ResolveIt - Dispute Resolution Platform

A comprehensive full-stack web application for managing dispute resolution cases with real-time updates, file management, and administrative oversight.

## 📋 Features

### 🔐 Authentication & User Management
- **User Registration & Login** with JWT authentication
- **Role-based Access Control** (User/Admin)
- **Email Verification** (production mode)
- **Password Reset** functionality
- **Default Admin Account** auto-created on startup

### 📝 Case Management
- **Multi-step Case Creation** with file uploads
- **Case Lifecycle Tracking** with status updates
- **Witness Management** for case documentation
- **File Upload System** with local storage
- **Timeline Tracking** for case progress

### 🎛️ Admin Dashboard
- **Comprehensive Analytics** and statistics
- **Case Management** with filtering and search
- **User Management** capabilities
- **Real-time Updates** via Socket.IO
- **Bulk Operations** for case status updates

### 📊 User Dashboard
- **Personal Case Overview** with statistics
- **Case Creation** and management
- **File Upload** and management
- **Real-time Notifications**

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with bcrypt
- **Socket.IO** for real-time updates
- **Multer** for file uploads
- **Nodemailer** for email notifications
- **Helmet** for security headers
- **Rate Limiting** and CORS protection

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Shadcn UI** with Radix UI
- **Tailwind CSS** for styling
- **React Hook Form** with Zod validation
- **TanStack Query** for data fetching
- **React Router DOM** for navigation

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
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript interfaces
│   │   └── main.tsx         # App entry point
│   └── package.json
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

### Default Admin Account
- **Auto-created** on server startup
- **Email**: admin@resolveit.com
- **Password**: admin123
- **Full admin privileges**

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password

### Cases
- `POST /api/cases` - Create new case
- `GET /api/cases` - Get user cases
- `GET /api/cases/:id` - Get case details
- `PUT /api/cases/:id` - Update case
- `POST /api/cases/:id/files` - Upload files
- `DELETE /api/cases/:id` - Delete case

### Admin
- `GET /api/admin/dashboard` - Admin statistics
- `GET /api/admin/cases` - All cases
- `GET /api/admin/users` - All users
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

### File Management
- **Multiple file types** (images, videos, audio, documents)
- **Local storage** with organized directory structure
- **File size validation** and type checking
- **Secure file serving** with authentication

### Real-time Features
- **Socket.IO integration** for live updates
- **Case status notifications**
- **Admin dashboard updates**
- **User notification system**

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password hashing** with bcrypt
- **Input validation** and sanitization
- **Rate limiting** to prevent abuse
- **CORS protection** for cross-origin requests
- **Helmet security headers**
- **File upload validation**

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Configure MongoDB connection
3. Set up email service (SMTP)
4. Configure file storage
5. Set secure JWT secret

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to static hosting (Vercel, Netlify, etc.)
3. Configure environment variables
4. Set up API URL for production

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