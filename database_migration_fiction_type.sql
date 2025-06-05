-- Migration script to add fiction_type column to stories table
-- Run this script on your MySQL database before starting the application

-- Step 1: Add the fiction_type column as nullable first
ALTER TABLE stories ADD COLUMN fiction_type VARCHAR(255) NULL;

-- Step 2: Update existing records with a default value
-- You can customize this based on your business logic
UPDATE stories SET fiction_type = 'General Fiction' WHERE fiction_type IS NULL;

-- Step 3: Optionally, make the column NOT NULL after data migration
-- Uncomment the following line if you want to enforce NOT NULL constraint
-- ALTER TABLE stories MODIFY COLUMN fiction_type VARCHAR(255) NOT NULL;

-- Verify the changes
SELECT COUNT(*) as total_stories, 
       COUNT(fiction_type) as stories_with_fiction_type,
       COUNT(*) - COUNT(fiction_type) as stories_without_fiction_type
FROM stories; 