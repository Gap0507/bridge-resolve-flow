# ResolveIt API Documentation

## Overview

ResolveIt is a dispute resolution platform that provides mediation services through a structured case lifecycle. This API documentation covers all endpoints for user authentication, case management, and admin operations.

**Base URL:** `http://localhost:5000/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Authentication Endpoints

#### 1. Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "user"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### 2. Login User
**POST** `/auth/login`

Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "jwt_token_here"
  }
}
```

#### 3. Get Profile
**GET** `/auth/me`

Get current user's profile information.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### 4. Update Profile
**PUT** `/auth/profile`

Update user profile information.

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+1234567891"
}
```

#### 5. Change Password
**PUT** `/auth/change-password`

Change user password.

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

#### 6. Forgot Password
**POST** `/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### 7. Reset Password
**POST** `/auth/reset-password`

Reset password using token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "newpassword123"
}
```

#### 8. Logout
**POST** `/auth/logout`

Logout user and invalidate token.

---

### Case Management Endpoints

#### 1. Create Case
**POST** `/cases`

Create a new case.

**Request Body:**
```json
{
  "caseType": "Family",
  "title": "Property Dispute",
  "description": "Dispute over family property inheritance",
  "oppositePartyName": "Jane Smith",
  "oppositePartyEmail": "jane@example.com",
  "oppositePartyPhone": "+1234567890",
  "isPendingInCourt": false,
  "firNumber": "FIR-2024-001",
  "courtName": "District Court",
  "policeStation": "Central Police Station",
  "witnesses": [
    {
      "name": "Witness 1",
      "email": "witness1@example.com",
      "phone": "+1234567891",
      "relationship": "Neighbor"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Case created successfully",
  "data": {
    "case": {
      "_id": "case_id",
      "caseType": "Family",
      "title": "Property Dispute",
      "description": "Dispute over family property inheritance",
      "status": "Pending Verification",
      "oppositePartyName": "Jane Smith",
      "oppositePartyEmail": "jane@example.com",
      "oppositePartyPhone": "+1234567890",
      "isPendingInCourt": false,
      "witnesses": [...],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### 2. Get User Cases
**GET** `/cases`

Get all cases for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by case status
- `type` (optional): Filter by case type
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cases": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### 3. Get Case Details
**GET** `/cases/:id`

Get detailed information about a specific case.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "case": {
      "_id": "case_id",
      "caseType": "Family",
      "title": "Property Dispute",
      "description": "Dispute over family property inheritance",
      "status": "Pending Verification",
      "oppositePartyName": "Jane Smith",
      "oppositePartyEmail": "jane@example.com",
      "oppositePartyPhone": "+1234567890",
      "isPendingInCourt": false,
      "witnesses": [...],
      "proofFiles": [...],
      "assignedPanel": [...],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### 4. Update Case
**PUT** `/cases/:id`

Update case information (only for cases in early stages).

**Request Body:**
```json
{
  "title": "Updated Property Dispute",
  "description": "Updated description of the dispute",
  "oppositePartyName": "Jane Smith Updated",
  "oppositePartyEmail": "jane.updated@example.com"
}
```

#### 5. Delete Case
**DELETE** `/cases/:id`

Delete a case (only for cases in "Pending Verification" status).

#### 6. Upload Files
**POST** `/cases/:id/files`

Upload supporting documents for a case.

**Request Body:** (multipart/form-data)
- `files`: Array of files (images, documents, videos, audio)

**Response (200):**
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": {
    "uploadedFiles": [
      {
        "_id": "file_id",
        "name": "document.pdf",
        "type": "application/pdf",
        "size": 1024000,
        "url": "uploads/document.pdf"
      }
    ]
  }
}
```

#### 7. Add Witness
**POST** `/cases/:id/witnesses`

Add a witness to a case.

**Request Body:**
```json
{
  "name": "New Witness",
  "email": "newwitness@example.com",
  "phone": "+1234567892",
  "relationship": "Colleague"
}
```

#### 8. Remove Witness
**DELETE** `/cases/:id/witnesses/:witnessId`

Remove a witness from a case.

#### 9. Update Case Status (Admin Only)
**PUT** `/cases/:id/status`

Update case status (admin only).

**Request Body:**
```json
{
  "status": "Verified"
}
```

**Available Statuses:**
- `Pending Verification`
- `Verified`
- `Awaiting Response`
- `Accepted`
- `Rejected`
- `Panel Created`
- `Mediation in Progress`
- `Resolved`
- `Unresolved`

#### 10. Assign Panel (Admin Only)
**POST** `/cases/:id/panel`

Assign mediation panel to a case (admin only).

**Request Body:**
```json
{
  "members": [
    {
      "name": "Lawyer 1",
      "email": "lawyer1@example.com",
      "phone": "+1234567893",
      "role": "Lawyer"
    },
    {
      "name": "Religious Leader 1",
      "email": "religious1@example.com",
      "phone": "+1234567894",
      "role": "Religious Leader"
    },
    {
      "name": "Community Rep 1",
      "email": "community1@example.com",
      "phone": "+1234567895",
      "role": "Community Representative"
    }
  ]
}
```

---

### Admin Endpoints

#### 1. Get Dashboard Stats
**GET** `/admin/dashboard`

Get admin dashboard statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalCases": 150,
    "pendingCases": 25,
    "verifiedCases": 30,
    "inProgressCases": 45,
    "resolvedCases": 40,
    "unresolvedCases": 10,
    "totalUsers": 75,
    "recentCases": [...],
    "caseTypeDistribution": {
      "Family": 40,
      "Business": 30,
      "Criminal": 20,
      "Property": 35,
      "Employment": 15,
      "Other": 10
    }
  }
}
```

#### 2. Get System Analytics
**GET** `/admin/analytics`

Get detailed system analytics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "monthlyStats": [...],
    "caseResolutionRate": 85.5,
    "averageResolutionTime": 15.2,
    "userGrowth": [...],
    "topCaseTypes": [...]
  }
}
```

#### 3. Get All Cases
**GET** `/admin/cases`

Get all cases with filtering and pagination (admin only).

**Query Parameters:**
- `status` (optional): Filter by case status
- `type` (optional): Filter by case type
- `page` (optional): Page number
- `limit` (optional): Items per page

#### 4. Bulk Update Case Status
**PUT** `/admin/cases/bulk-status`

Update status of multiple cases at once (admin only).

**Request Body:**
```json
{
  "caseIds": ["case_id_1", "case_id_2"],
  "status": "Verified"
}
```

#### 5. Get All Users
**GET** `/admin/users`

Get all users with filtering and pagination (admin only).

**Query Parameters:**
- `role` (optional): Filter by user role
- `page` (optional): Page number
- `limit` (optional): Items per page

#### 6. Get User Details
**GET** `/admin/users/:id`

Get detailed information about a specific user (admin only).

#### 7. Update User Role
**PUT** `/admin/users/:id/role`

Update user role (admin only).

**Request Body:**
```json
{
  "role": "admin"
}
```

#### 8. Delete User
**DELETE** `/admin/users/:id`

Delete a user account (admin only).

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Authentication failed"
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "message": "Access denied"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Data Models

### User Model
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (unique)",
  "phone": "String",
  "password": "String (hashed)",
  "role": "String (user/admin)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Case Model
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User)",
  "caseType": "String (Family/Business/Criminal/Property/Employment/Other)",
  "title": "String",
  "description": "String",
  "status": "String",
  "oppositePartyName": "String",
  "oppositePartyEmail": "String",
  "oppositePartyPhone": "String",
  "isPendingInCourt": "Boolean",
  "firNumber": "String",
  "courtName": "String",
  "policeStation": "String",
  "witnesses": "Array of Witness objects",
  "proofFiles": "Array of File objects",
  "assignedPanel": "Array of Panel Member objects",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Witness Model
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "phone": "String",
  "relationship": "String"
}
```

### Panel Member Model
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "phone": "String",
  "role": "String (Lawyer/Religious Leader/Community Representative)"
}
```

---

## Usage Examples

### 1. Complete Case Creation Flow

```bash
# 1. Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "password123"
  }'

# 2. Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# 3. Create case
curl -X POST http://localhost:5000/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "caseType": "Family",
    "title": "Property Dispute",
    "description": "Dispute over family property inheritance",
    "oppositePartyName": "Jane Smith",
    "oppositePartyEmail": "jane@example.com",
    "oppositePartyPhone": "+1234567890"
  }'

# 4. Upload files
curl -X POST http://localhost:5000/api/cases/CASE_ID/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@document.pdf" \
  -F "files=@image.jpg"
```

### 2. Admin Panel Assignment Flow

```bash
# 1. Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# 2. Get all pending cases
curl -X GET "http://localhost:5000/api/admin/cases?status=Pending" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 3. Update case status to verified
curl -X PUT http://localhost:5000/api/cases/CASE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"status": "Verified"}'

# 4. Assign mediation panel
curl -X POST http://localhost:5000/api/cases/CASE_ID/panel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "members": [
      {
        "name": "Lawyer 1",
        "email": "lawyer1@example.com",
        "phone": "+1234567893",
        "role": "Lawyer"
      },
      {
        "name": "Religious Leader 1",
        "email": "religious1@example.com",
        "phone": "+1234567894",
        "role": "Religious Leader"
      },
      {
        "name": "Community Rep 1",
        "email": "community1@example.com",
        "phone": "+1234567895",
        "role": "Community Representative"
      }
    ]
  }'
```

---

## Testing with Postman

1. Import the `ResolveIt_API_Collection.json` file into Postman
2. Set the `baseUrl` variable to your API endpoint
3. Start with the "Login User" request to get an authentication token
4. The token will be automatically set in the collection variables
5. Use subsequent requests to test the API functionality

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Input validation and sanitization are implemented
- File uploads are restricted to specific file types
- Admin endpoints require proper authorization
- Rate limiting is implemented for sensitive endpoints

---

## Support

For API support or questions, please contact the development team or refer to the project documentation. 