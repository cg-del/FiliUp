# FiliUp API Documentation

## Authentication

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
    "email": "string",
    "password": "string"
}
```

**Response:**
```json
{
    "token": "string",
    "refreshToken": "string",
    "user": {
        "id": "uuid",
        "email": "string",
        "fullName": "string",
        "role": "ADMIN|TEACHER|STUDENT",
        "sectionId": "uuid"
    }
}
```

### Register
```http
POST /api/auth/register
```

**Request Body:**
```json
{
    "email": "string",
    "password": "string",
    "fullName": "string",
    "role": "TEACHER|STUDENT"
}
```

### Refresh Token
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
    "refreshToken": "string"
}
```

## Admin Endpoints

### Get System Stats
```http
GET /api/admin/stats
```

**Response:**
```json
{
    "totalUsers": "number",
    "activeStudents": "number",
    "totalSections": "number",
    "systemHealth": "number"
}
```

### List Users
```http
GET /api/admin/users?page=0&size=10&role=STUDENT
```

**Response:**
```json
{
    "content": [
        {
            "id": "uuid",
            "email": "string",
            "fullName": "string",
            "role": "string",
            "sectionId": "uuid",
            "isActive": "boolean",
            "createdAt": "timestamp"
        }
    ],
    "totalElements": "number",
    "totalPages": "number",
    "size": "number",
    "number": "number"
}
```

### Create User
```http
POST /api/admin/users
```

**Request Body:**
```json
{
    "email": "string",
    "password": "string",
    "fullName": "string",
    "role": "ADMIN|TEACHER|STUDENT",
    "sectionId": "uuid?"
}
```

## Teacher Endpoints

### List Sections
```http
GET /api/teacher/sections
```

**Response:**
```json
{
    "sections": [
        {
            "id": "uuid",
            "name": "string",
            "gradeLevel": "string",
            "studentCount": "number",
            "activeStudents": "number",
            "averageProgress": "number"
        }
    ]
}
```

### Create Section
```http
POST /api/teacher/sections
```

**Request Body:**
```json
{
    "name": "string",
    "gradeLevel": "string",
    "capacity": "number"
}
```

**Response:**
```json
{
    "id": "uuid",
    "name": "string",
    "inviteCode": "string"
}
```

### Get Section Details
```http
GET /api/teacher/sections/{id}
```

**Response:**
```json
{
    "id": "uuid",
    "name": "string",
    "gradeLevel": "string",
    "inviteCode": "string",
    "students": [
        {
            "id": "uuid",
            "name": "string",
            "score": "number",
            "lessonsCompleted": "number",
            "lastActive": "timestamp",
            "status": "string"
        }
    ],
    "stats": {
        "totalStudents": "number",
        "activeStudents": "number",
        "averageScore": "number",
        "averageLessons": "number"
    }
}
```

## Student Endpoints

### Register with Section
```http
POST /api/student/register-section
```

**Request Body:**
```json
{
    "registrationCode": "string"
}
```

### Get Profile
```http
GET /api/student/profile
```

**Response:**
```json
{
    "id": "uuid",
    "name": "string",
    "email": "string",
    "section": {
        "id": "uuid",
        "name": "string"
    },
    "progress": {
        "completedLessons": "number",
        "totalScore": "number",
        "currentLevel": "string"
    },
    "achievements": [
        {
            "id": "number",
            "name": "string",
            "icon": "string",
            "earned": "boolean"
        }
    ],
    "recentActivity": [
        {
            "lesson": "string",
            "score": "number",
            "date": "timestamp"
        }
    ]
}
```

### Get Lessons
```http
GET /api/student/lessons
```

**Response:**
```json
{
    "phases": [
        {
            "id": "uuid",
            "title": "string",
            "description": "string",
            "lessons": [
                {
                    "id": "uuid",
                    "title": "string",
                    "description": "string",
                    "isUnlocked": "boolean",
                    "progress": "number",
                    "activities": [
                        {
                            "type": "string",
                            "status": "locked|unlocked|completed",
                            "score": "number?"
                        }
                    ]
                }
            ]
        }
    ]
}
```

### Submit Activity
```http
POST /api/student/activities/{id}/submit
```

**Request Body:**
```json
{
    "answers": "any[]",
    "timeSpentSeconds": "number"
}
```

**Response:**
```json
{
    "score": "number",
    "percentage": "number",
    "isCompleted": "boolean",
    "correctAnswers": "number",
    "totalQuestions": "number",
    "nextActivity": {
        "id": "uuid",
        "type": "string"
    }
}
```

### Get Leaderboard
```http
GET /api/student/leaderboard
```

**Response:**
```json
{
    "currentUserRank": "number",
    "leaderboard": [
        {
            "rank": "number",
            "name": "string",
            "score": "number",
            "lessonsCompleted": "number",
            "isCurrentUser": "boolean"
        }
    ]
}
```
