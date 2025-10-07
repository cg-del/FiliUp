# FiliUp Database Schema

## Core Tables

### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT')),
    section_id UUID REFERENCES sections(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### sections
```sql
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    grade_level VARCHAR(50),
    teacher_id UUID REFERENCES users(id),
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    capacity INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### phases
```sql
CREATE TABLE phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### lessons
```sql
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase_id UUID REFERENCES phases(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    content JSONB, -- Stores lesson slides
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### activities
```sql
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id),
    activity_type VARCHAR(50) CHECK (activity_type IN 
        ('MULTIPLE_CHOICE', 'DRAG_DROP', 'MATCHING_PAIRS', 'STORY_COMPREHENSION')),
    order_index INTEGER NOT NULL,
    content JSONB NOT NULL, -- Stores questions, options, answers
    passing_percentage INTEGER DEFAULT 75,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Progress Tracking

### student_lesson_progress
```sql
CREATE TABLE student_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id),
    lesson_id UUID REFERENCES lessons(id),
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, lesson_id)
);
```

### student_activity_attempts
```sql
CREATE TABLE student_activity_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id),
    activity_id UUID REFERENCES activities(id),
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    time_spent_seconds INTEGER,
    answers JSONB, -- Stores student's answers
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### student_achievements
```sql
CREATE TABLE student_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id),
    achievement_type VARCHAR(100) NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## System Tables

### activity_logs
```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## JSONB Schemas

### Lesson Content
```json
{
    "slides": [
        {
            "title": "string",
            "content": ["string"],
            "order": "number"
        }
    ]
}
```

### Activity Content

#### Multiple Choice
```json
{
    "questions": [
        {
            "id": "string",
            "question": "string",
            "options": ["string"],
            "correctAnswer": "number",
            "explanation": "string"
        }
    ]
}
```

#### Drag & Drop
```json
{
    "items": [
        {
            "id": "string",
            "text": "string",
            "category": "string"
        }
    ],
    "categories": [
        {
            "id": "string",
            "name": "string",
            "color": "string"
        }
    ]
}
```

#### Matching Pairs
```json
{
    "pairs": [
        {
            "id": "string",
            "left": "string",
            "right": "string"
        }
    ]
}
```

#### Story Comprehension
```json
{
    "story": "string",
    "questions": [
        {
            "id": "string",
            "question": "string",
            "options": ["string"],
            "correctAnswer": "number",
            "explanation": "string"
        }
    ]
}
```
