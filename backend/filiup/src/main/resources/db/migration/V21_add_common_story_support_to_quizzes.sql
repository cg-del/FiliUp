-- Add common story support to quizzes table
-- V21: Add common story support to quizzes table

-- Add common_story_id column (nullable for regular story quizzes)
ALTER TABLE quizzes 
ADD COLUMN common_story_id BINARY(16) NULL;

-- Add quiz_type column to distinguish between regular and common story quizzes
ALTER TABLE quizzes 
ADD COLUMN quiz_type VARCHAR(20) NOT NULL DEFAULT 'STORY';

-- Make story_id nullable since common story quizzes won't have a regular story
ALTER TABLE quizzes 
MODIFY COLUMN story_id BINARY(16) NULL;

-- Add foreign key constraint for common_story_id
ALTER TABLE quizzes 
ADD CONSTRAINT FK_quiz_common_story 
FOREIGN KEY (common_story_id) REFERENCES common_stories(story_id);

-- Add check constraint to ensure either story_id or common_story_id is provided
ALTER TABLE quizzes
ADD CONSTRAINT CHK_quiz_story_type 
CHECK (
    (story_id IS NOT NULL AND common_story_id IS NULL AND quiz_type = 'STORY') OR
    (story_id IS NULL AND common_story_id IS NOT NULL AND quiz_type = 'COMMON_STORY')
);

-- Add index on quiz_type for better query performance
CREATE INDEX IDX_quiz_type ON quizzes(quiz_type);

-- Add index on common_story_id for better query performance
CREATE INDEX IDX_quiz_common_story_id ON quizzes(common_story_id); 