-- Add story_id column to quizzes table
ALTER TABLE quizzes ADD COLUMN story_id BIGINT;

-- Add foreign key constraint
ALTER TABLE quizzes ADD CONSTRAINT fk_quiz_story 
    FOREIGN KEY (story_id) REFERENCES stories(story_id) 
    ON DELETE CASCADE;

-- Add unique constraint to ensure one-to-one relationship
ALTER TABLE quizzes ADD CONSTRAINT uk_quiz_story UNIQUE (story_id); 