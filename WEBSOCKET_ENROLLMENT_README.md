# WebSocket Enrollment System

This document describes the real-time enrollment notification system implemented using WebSockets in the FiliUp application.

## Overview

The WebSocket enrollment system provides real-time notifications for:
- **Teachers**: Receive instant notifications when students request to join their classes
- **Students**: Receive instant notifications when their enrollment requests are approved or rejected

## Architecture

### Backend Components

1. **WebSocketConfig** (`backend/filiup/src/main/java/edu/cit/filiup/config/WebSocketConfig.java`)
   - Configures STOMP over WebSocket
   - Endpoints: `/ws` (main WebSocket endpoint)
   - Message brokers: `/topic`, `/queue`

2. **EnrollmentServiceImpl** (`backend/filiup/src/main/java/edu/cit/filiup/service/impl/EnrollmentServiceImpl.java`)
   - Enhanced with WebSocket messaging
   - Sends notifications when students enroll or get accepted
   - Uses `SimpMessagingTemplate` to send messages

### Frontend Components

1. **enrollmentWebSocketService** (`frontend/src/lib/services/enrollmentWebSocketService.ts`)
   - Manages WebSocket connections for enrollment notifications
   - Handles authentication and message routing
   - Provides connection status monitoring

2. **EnrollmentManagement** (`frontend/src/components/EnrollmentManagement.tsx`)
   - Teacher component with real-time enrollment request updates
   - Shows WebSocket connection status
   - Automatically updates pending enrollments list

3. **StudentEnrollment** (`frontend/src/components/StudentEnrollment.tsx`)
   - Student component for enrollment requests
   - Receives real-time acceptance/rejection notifications
   - Shows connection status

## Message Types

### For Teachers (NEW_ENROLLMENT)
```json
{
  "type": "NEW_ENROLLMENT",
  "classId": "uuid-of-class",
  "classCode": "CLASS_CODE",
  "enrollment": {
    "id": "enrollment-id",
    "studentName": "Student Name",
    "studentEmail": "student@email.com",
    "enrollmentDate": "2024-01-01T00:00:00",
    // ... other enrollment details
  },
  "message": "Student Name has requested to join your class: Class Name"
}
```

### For Students (ENROLLMENT_ACCEPTED)
```json
{
  "type": "ENROLLMENT_ACCEPTED",
  "classId": "uuid-of-class",
  "classCode": "CLASS_CODE",
  "className": "Class Name",
  "message": "Your enrollment request for Class Name has been accepted!"
}
```

## How to Test

### Prerequisites
1. Backend server running on `localhost:8080`
2. Frontend running on `localhost:5173` or `localhost:3000`
3. Valid teacher and student accounts

### Test Scenario

1. **Setup Teacher View**:
   - Login as a teacher
   - Navigate to class management
   - Select a class to view the EnrollmentManagement component
   - Verify WebSocket connection status (green WiFi icon)

2. **Setup Student View** (in another browser/incognito):
   - Login as a student
   - Navigate to enrollment section
   - Verify WebSocket connection status (green WiFi icon)

3. **Test Real-time Enrollment**:
   - As student: Enter a valid class code and click "Request to Join Class"
   - Teacher view should immediately show:
     - Toast notification: "New Enrollment Request"
     - New enrollment appears in the pending list
     - Updated badge count

4. **Test Real-time Approval**:
   - As teacher: Click "Approve" on the enrollment request
   - Student view should immediately show:
     - Toast notification: "🎉 Enrollment Approved!"
     - Automatic page refresh or redirect

## WebSocket Connection Indicators

- **Green WiFi Icon**: WebSocket connected, real-time updates active
- **Gray WiFi Icon**: WebSocket disconnected, no real-time updates
- **Status Messages**: "Live updates enabled" when connected

## Debugging

### Backend Logs
```bash
# Look for these log messages in the Spring Boot console:
- "Sent enrollment notification to teacher {teacherId} for class {className}"
- "Sent acceptance notification to student {studentId} for class {className}"
```

### Frontend Console
```javascript
// Check browser console for these messages:
- "Enrollment WebSocket connected successfully"
- "Received enrollment message: {message}"
- "Student enrollment WebSocket connected successfully"
```

### Common Issues

1. **WebSocket Connection Fails**:
   - Check if backend WebSocket server is running
   - Verify CORS configuration in `WebSocketConfig`
   - Ensure JWT token is valid

2. **Messages Not Received**:
   - Check that user IDs match between frontend and backend
   - Verify message routing paths (`/user/queue/enrollment`)
   - Check browser console for subscription errors

3. **Authentication Issues**:
   - Ensure JWT token is included in WebSocket connection
   - Check token expiration
   - Verify user role permissions

## Configuration

### Backend Configuration
```yaml
# application.yml (if needed)
spring:
  websocket:
    message-broker:
      enabled: true
```

### Frontend Configuration
```typescript
// WebSocket URL in enrollmentWebSocketService.ts
const wsUrl = `ws://localhost:8080/ws?token=${encodeURIComponent(token)}`;
```

## Security Considerations

1. **Authentication**: WebSocket connections require valid JWT tokens
2. **Authorization**: Users only receive messages relevant to their role and classes
3. **Message Filtering**: Frontend filters messages by class ID to prevent cross-class notifications

## Performance Notes

- WebSocket connections are established per user session
- Messages are sent only to relevant users (teacher of specific class, specific student)
- Connection cleanup happens automatically on component unmount
- Graceful fallback if WebSocket connection fails (polling could be implemented)

## Future Enhancements

1. **Message Persistence**: Store offline messages for later delivery
2. **Typing Indicators**: Show when teacher is reviewing enrollment requests
3. **Bulk Notifications**: Handle multiple enrollments efficiently
4. **Connection Recovery**: Automatic reconnection with exponential backoff
5. **Message History**: Show recent enrollment activities

## Testing Checklist

- [ ] Teacher receives real-time enrollment notifications
- [ ] Student receives real-time approval notifications
- [ ] WebSocket connection status indicators work
- [ ] Messages are filtered by class ID
- [ ] Authentication works for WebSocket connections
- [ ] Graceful handling of connection failures
- [ ] Proper cleanup on component unmount
- [ ] Cross-browser compatibility
- [ ] Mobile device compatibility 