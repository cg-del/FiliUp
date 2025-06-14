# Admin API Endpoints Documentation

This document describes the admin-specific API endpoints for the FiliUp application. All admin endpoints require ADMIN role authentication.

## Base URL
All admin endpoints are prefixed with `/api/admin`

## Authentication
All endpoints require authentication with ADMIN role. Include the JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## User Management Endpoints

### GET /api/admin/users
Retrieve all users with pagination and filtering options.

**Query Parameters:**
- `page` (int, default: 0) - Page number
- `size` (int, default: 20) - Number of items per page
- `sortBy` (string, default: "createdAt") - Field to sort by
- `sortDir` (string, default: "desc") - Sort direction (asc/desc)
- `role` (string, optional) - Filter by user role (STUDENT, TEACHER, ADMIN)
- `isActive` (boolean, optional) - Filter by active status

**Response:**
```json
{
  "status": "success",
  "message": "Users retrieved successfully",
  "data": {
    "users": [...],
    "totalUsers": 150,
    "currentPage": 0,
    "totalPages": 8
  }
}
```

### POST /api/admin/users
Create a new user.

**Request Body:**
```json
{
  "userName": "john_doe",
  "userEmail": "john@example.com",
  "userPassword": "password123",
  "userRole": "STUDENT",
  "userProfilePictureUrl": "https://example.com/photo.jpg"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "userId": "uuid",
    "userName": "john_doe",
    "userEmail": "john@example.com",
    "userRole": "STUDENT",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00"
  }
}
```

### PUT /api/admin/users/{userId}
Update an existing user.

**Path Parameters:**
- `userId` (UUID) - The user ID to update

**Request Body:** (partial update)
```json
{
  "userName": "new_username",
  "userEmail": "newemail@example.com",
  "userRole": "TEACHER",
  "isActive": false
}
```

### DELETE /api/admin/users/{userId}
Delete a user.

**Path Parameters:**
- `userId` (UUID) - The user ID to delete

### PATCH /api/admin/users/{userId}/toggle-status
Toggle user active status.

**Path Parameters:**
- `userId` (UUID) - The user ID to toggle

### POST /api/admin/users/bulk-action
Perform bulk actions on multiple users.

**Request Body:**
```json
{
  "userIds": ["uuid1", "uuid2", "uuid3"],
  "action": "activate" // or "deactivate" or "delete"
}
```

## Story Management Endpoints

### GET /api/admin/stories
Retrieve all stories with pagination.

**Query Parameters:**
- `page` (int, default: 0)
- `size` (int, default: 20)
- `sortBy` (string, default: "storyId")
- `status` (string, optional) - Filter by status
- `teacherId` (UUID, optional) - Filter by teacher

### PUT /api/admin/stories/{storyId}
Update a story.

**Path Parameters:**
- `storyId` (UUID) - The story ID to update

**Request Body:**
```json
{
  "title": "Updated Story Title",
  "content": "Updated story content...",
  "fictionType": "Adventure",
  "genre": "Fantasy"
}
```

### DELETE /api/admin/stories/{storyId}
Delete a story.

**Path Parameters:**
- `storyId` (UUID) - The story ID to delete

## Analytics and Dashboard Endpoints

### GET /api/admin/dashboard
Get comprehensive dashboard data.

**Response:**
```json
{
  "status": "success",
  "message": "Dashboard data retrieved successfully",
  "data": {
    "userStats": {
      "totalUsers": 500,
      "activeUsers": 450,
      "students": 400,
      "teachers": 95,
      "admins": 5,
      "recentRegistrations": 25
    },
    "contentStats": {
      "totalStories": 150,
      "totalClasses": 50,
      "totalQuizzes": 200,
      "totalReports": 10
    },
    "activityStats": {
      "activeUsersLast24h": 120,
      "activeUsersLastWeek": 350,
      "dailyRegistrations": {
        "2024-01-15": 5,
        "2024-01-14": 3,
        "2024-01-13": 7
      }
    },
    "lastUpdated": "2024-01-15T10:30:00"
  }
}
```

### GET /api/admin/analytics/user-growth
Get user growth analytics.

**Query Parameters:**
- `days` (int, default: 30) - Number of days to analyze

**Response:**
```json
{
  "status": "success",
  "message": "User growth analytics retrieved successfully",
  "data": {
    "dailyRegistrations": {
      "2024-01-15": 5,
      "2024-01-14": 3
    },
    "totalNewUsers": 25,
    "periodDays": 30,
    "averagePerDay": 0.83
  }
}
```

### GET /api/admin/analytics/activity-summary
Get activity summary.

**Response:**
```json
{
  "status": "success",
  "message": "Activity summary retrieved successfully",
  "data": {
    "activeUsersLast24h": 120,
    "activeUsersLastWeek": 350
  }
}
```

## Content Moderation Endpoints

### GET /api/admin/reports
Get all reports.

**Query Parameters:**
- `page` (int, default: 0)
- `size` (int, default: 20)

**Response:**
```json
{
  "status": "success",
  "message": "Reports retrieved successfully",
  "data": {
    "reports": [...],
    "totalReports": 10,
    "currentPage": 0
  }
}
```

## System Monitoring Endpoints

### GET /api/admin/system/status
Get system status and health information.

**Response:**
```json
{
  "status": "success",
  "message": "System status retrieved successfully",
  "data": {
    "database": "connected",
    "memory": {
      "total": 2147483648,
      "free": 1073741824,
      "used": 1073741824,
      "max": 4294967296
    },
    "timestamp": "2024-01-15T10:30:00",
    "uptime": 1642233000000
  }
}
```

### GET /api/admin/logs/user-activities
Get user activity logs.

**Query Parameters:**
- `page` (int, default: 0)
- `size` (int, default: 50)
- `userId` (UUID, optional) - Filter by specific user

**Response:**
```json
{
  "status": "success",
  "message": "User activity logs retrieved successfully",
  "data": {
    "activities": [
      {
        "userId": "uuid",
        "userName": "john_doe",
        "userRole": "STUDENT",
        "lastLogin": "2024-01-15T10:30:00",
        "action": "LOGIN"
      }
    ],
    "totalActivities": 100,
    "currentPage": 0
  }
}
```

## Configuration Endpoints

### GET /api/admin/settings
Get system settings.

**Response:**
```json
{
  "status": "success",
  "message": "System settings retrieved successfully",
  "data": {
    "maxUsersPerClass": 50,
    "defaultUserRole": "STUDENT",
    "sessionTimeoutMinutes": 60,
    "enableRegistration": true,
    "enableGuestAccess": false
  }
}
```

### PUT /api/admin/settings
Update system settings.

**Request Body:**
```json
{
  "maxUsersPerClass": 30,
  "sessionTimeoutMinutes": 90,
  "enableRegistration": false
}
```

## Error Response Format

All endpoints return errors in the following format:

```json
{
  "status": "error",
  "message": "Error description",
  "data": null
}
```

Common HTTP Status Codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient privileges)
- `404` - Not Found
- `500` - Internal Server Error

## Authentication Requirements

All admin endpoints require:
1. Valid JWT token in Authorization header
2. User must have ADMIN role
3. Token must not be expired

## Rate Limiting

Admin endpoints may be subject to rate limiting to prevent abuse. Current limits:
- 100 requests per minute per user
- 1000 requests per hour per user

## Notes

- All datetime fields are returned in ISO 8601 format
- UUIDs are used for all entity identifiers
- Pagination starts from page 0
- Bulk operations have a maximum limit of 100 items per request
- File uploads have a maximum size limit of 10MB