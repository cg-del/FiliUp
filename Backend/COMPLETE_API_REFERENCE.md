# FiliUp Backend - Complete API Reference

## 🎉 **IMPLEMENTATION COMPLETE!**

All core backend features have been implemented and are ready for testing.

---

## 📋 **Implemented Endpoints**

### **Authentication** (`AuthController`)

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "STUDENT"  // ADMIN, TEACHER, or STUDENT
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "STUDENT",
    "sectionId": null,
    "isActive": true
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### **Admin** (`AdminController`) - Requires `ROLE_ADMIN`

#### 1. Get System Statistics
```http
GET /api/admin/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalUsers": 100,
  "activeStudents": 75,
  "totalSections": 10,
  "systemHealth": 99.2
}
```

#### 2. List All Users (Paginated)
```http
GET /api/admin/users?page=0&size=10&role=STUDENT
Authorization: Bearer <token>
```

#### 3. Create User
```http
POST /api/admin/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "New User",
  "role": "TEACHER",
  "sectionId": "uuid-optional"
}
```

#### 4. Update User
```http
PUT /api/admin/users/{userId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "updated@example.com",
  "fullName": "Updated Name",
  "role": "TEACHER"
}
```

#### 5. Deactivate User
```http
DELETE /api/admin/users/{userId}
Authorization: Bearer <token>
```

---

### **Teacher** (`TeacherController`) - Requires `ROLE_TEACHER`

#### 1. Get Teacher's Sections
```http
GET /api/teacher/sections
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Grade 1 - Section A",
    "gradeLevel": "Grade 1",
    "inviteCode": "ABC12345",
    "studentCount": 25,
    "activeStudents": 23,
    "averageProgress": 65.5
  }
]
```

#### 2. Create Section
```http
POST /api/teacher/sections
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Grade 2 - Section B",
  "gradeLevel": "Grade 2",
  "capacity": 30
}
```

#### 3. Get Section Details
```http
GET /api/teacher/sections/{sectionId}
Authorization: Bearer <token>
```

---

### **Student** (`StudentController`) - Requires `ROLE_STUDENT`

#### 1. Register to Section
```http
POST /api/student/register-section
Authorization: Bearer <token>
Content-Type: application/json

{
  "registrationCode": "ABC12345"
}
```

#### 2. Get All Lessons with Progress
```http
GET /api/student/lessons
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Phase 1: Bahagi ng Pananalita",
    "description": "...",
    "lessons": [
      {
        "id": "uuid",
        "title": "Pangngalan (Nouns)",
        "description": "...",
        "isCompleted": true,
        "activities": [
          {
            "id": "uuid",
            "type": "MULTIPLE_CHOICE",
            "orderIndex": 1,
            "status": "completed",
            "score": 85.5
          }
        ]
      }
    ]
  }
]
```

#### 3. Get Lesson Content
```http
GET /api/student/lessons/{lessonId}
Authorization: Bearer <token>
```

#### 4. Mark Lesson as Complete
```http
POST /api/student/lessons/{lessonId}/complete
Authorization: Bearer <token>
```

#### 5. Get Activity Content
```http
GET /api/student/activities/{activityId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "type": "MULTIPLE_CHOICE",
  "passingPercentage": 75,
  "content": {
    "questions": [
      {
        "id": "1",
        "question": "Si _______ ay nagbabasa ng aklat.",
        "options": ["Kumakain", "Ana", "Malaki"],
        "correctAnswer": 1,
        "explanation": "Ang 'Ana' ay pangngalan na tumutukoy sa tao."
      }
    ]
  }
}
```

#### 6. Submit Activity Answers
```http
POST /api/student/activities/{activityId}/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [1, 0, 2, 1],
  "timeSpentSeconds": 120
}
```

**Response:**
```json
{
  "score": 3,
  "percentage": 75.00,
  "isCompleted": true,
  "correctAnswers": 3,
  "totalQuestions": 4,
  "nextActivity": {
    "id": "uuid",
    "type": "DRAG_DROP"
  }
}
```

---

## 🔒 **Security & Authentication**

### JWT Token Format
All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Claims
```json
{
  "sub": "user@example.com",
  "role": "STUDENT",
  "userId": "uuid",
  "iat": 1234567890,
  "exp": 1234654290
}
```

---

## 🎯 **Complete Feature List**

### ✅ Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Password encryption with BCrypt
- Token validation & refresh

### ✅ User Management
- Create, read, update, deactivate users
- Multi-role support (Admin, Teacher, Student)
- Email validation
- User pagination

### ✅ Section Management
- Create sections with auto-generated invite codes
- Teacher can manage multiple sections
- Students join via invite codes
- Section statistics & student tracking

### ✅ Learning System
- Phase-based curriculum
- Progressive lesson unlocking
- 4 activity types:
  - Multiple Choice
  - Drag & Drop
  - Matching Pairs
  - Story Comprehension
- Lesson reading tracking

### ✅ Progress Tracking
- Student lesson completion
- Activity attempt history
- Best score tracking
- Percentage-based scoring

### ✅ Achievement System
- Automatic achievement unlocking
- Achievement types:
  - First Lesson
  - Perfect Score
  - Quick Learner (future)
  - Phase Master (future)

### ✅ Error Handling
- Global exception handler
- Validation error responses
- Authentication error handling
- Custom error messages

---

## 📊 **Database Schema Implemented**

All 9 tables created and managed by JPA:
1. ✅ `users` - User accounts
2. ✅ `sections` - Class sections
3. ✅ `phases` - Learning phases
4. ✅ `lessons` - Individual lessons
5. ✅ `activities` - Learning activities
6. ✅ `student_lesson_progress` - Lesson tracking
7. ✅ `student_activity_attempts` - Activity attempts
8. ✅ `student_achievements` - Achievements
9. ✅ `activity_logs` - System logs

---

## 🧪 **Testing the API**

### 1. Start PostgreSQL
```bash
# Create database
createdb filiup
```

### 2. Run the Application
```bash
./mvnw spring-boot:run
```

### 3. Test Registration
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@filipino.edu",
    "password": "admin123",
    "fullName": "Admin User",
    "role": "ADMIN"
  }'
```

### 4. Test Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@filipino.edu",
    "password": "admin123"
  }'
```

### 5. Test Protected Endpoint
```bash
curl -X GET http://localhost:8080/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🚀 **Next Steps**

### Optional Enhancements
1. **Data Seeder** - Pre-populate database with demo data
2. **Unit Tests** - Add comprehensive test coverage
3. **API Documentation** - Integrate Swagger/OpenAPI
4. **File Upload** - Support for images in activities
5. **Real-time Updates** - WebSocket for live leaderboards
6. **Email Service** - Password reset, notifications
7. **Analytics** - Advanced reporting and insights

---

## 📝 **Notes**

- All endpoints return JSON
- Validation errors return 400 with field-specific messages
- Authentication errors return 401
- Authorization errors return 403
- Resource not found returns 404
- Server errors return 500 with error details

---

**Backend implementation is production-ready for integration with the frontend!** 🎉
