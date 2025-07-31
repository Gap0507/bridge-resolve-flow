# ResolveIt Backend API

A comprehensive Node.js/Express backend for the ResolveIt dispute resolution platform.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Registration, login, profile management, password reset
- **Case Management**: Complete CRUD operations for dispute cases
- **File Upload**: Secure file upload with Cloudinary integration
- **Real-time Updates**: Socket.IO for live notifications
- **Admin Dashboard**: Comprehensive admin panel with analytics
- **Security**: Helmet, CORS, rate limiting, input validation
- **Email Notifications**: Nodemailer integration for email verification and notifications

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)
- SMTP email service (Gmail, SendGrid, etc.)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/resolveit
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Email
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "age": 30,
  "gender": "male",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Get Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Case Endpoints

#### Create Case
```http
POST /api/cases
Authorization: Bearer <token>
Content-Type: application/json

{
  "caseType": "Family",
  "title": "Property Dispute",
  "description": "Dispute over inheritance...",
  "oppositePartyName": "Jane Doe",
  "oppositePartyEmail": "jane@example.com",
  "oppositePartyPhone": "+1234567890",
  "isPendingInCourt": false
}
```

#### Get User Cases
```http
GET /api/cases?status=all&caseType=all&page=1&limit=10
Authorization: Bearer <token>
```

#### Upload Files
```http
POST /api/cases/:id/files
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [file1, file2, ...]
```

### Admin Endpoints

#### Get Dashboard Stats
```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

#### Get All Cases
```http
GET /api/admin/cases?status=all&caseType=all&page=1&limit=20
Authorization: Bearer <token>
```

#### Update Case Status
```http
PUT /api/cases/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Verified",
  "resolutionDetails": "Case verified successfully"
}
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Authorization**: User and admin role management
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Protection against brute force attacks
- **CORS Protection**: Cross-origin resource sharing configuration
- **Helmet Security**: HTTP headers security
- **File Upload Security**: File type and size validation

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  age: Number,
  gender: String,
  address: {
    street: String,
    city: String,
    zipCode: String,
    state: String
  },
  phone: String,
  photo: String,
  role: String (user/admin),
  isVerified: Boolean,
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date
}
```

### Case Model
```javascript
{
  userId: ObjectId (ref: User),
  caseType: String (Family/Business/Criminal/etc.),
  title: String,
  description: String,
  oppositePartyName: String,
  oppositePartyEmail: String,
  oppositePartyPhone: String,
  oppositePartyAddress: Object,
  isPendingInCourt: Boolean,
  firNumber: String,
  courtName: String,
  policeStation: String,
  proofFiles: [FileUpload],
  witnesses: [Witness],
  status: String,
  assignedPanel: Panel,
  timeline: [TimelineEvent],
  resolutionDetails: String,
  resolvedAt: Date,
  resolvedBy: ObjectId (ref: User)
}
```

## 🔄 Real-time Features

The API includes Socket.IO for real-time updates:

- **Case Status Updates**: Notify users when their case status changes
- **New Case Notifications**: Alert admins when new cases are submitted
- **Live Dashboard Updates**: Real-time statistics and analytics

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - |
| `SMTP_HOST` | SMTP server host | - |
| `SMTP_PORT` | SMTP server port | 587 |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password | - |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |
| `MAX_FILE_SIZE` | Maximum file size (bytes) | 10485760 |
| `ALLOWED_FILE_TYPES` | Comma-separated MIME types | - |

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 📄 License

This project is licensed under the MIT License. 