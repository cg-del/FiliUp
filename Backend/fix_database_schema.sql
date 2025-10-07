-- FiliUp Database Schema Fix
-- Run this script directly on your PostgreSQL database to fix the schema issues

-- 1. Make content column nullable in activities table
ALTER TABLE activities ALTER COLUMN content DROP NOT NULL;

-- 2. Add new columns to activities table if they don't exist
DO $$ 
BEGIN
    -- Add title column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='activities' AND column_name='title') THEN
        ALTER TABLE activities ADD COLUMN title VARCHAR(255);
    END IF;
    
    -- Add instructions column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='activities' AND column_name='instructions') THEN
        ALTER TABLE activities ADD COLUMN instructions TEXT;
    END IF;
    
    -- Add story_text column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='activities' AND column_name='story_text') THEN
        ALTER TABLE activities ADD COLUMN story_text TEXT;
    END IF;
END $$;

-- 3. Create new tables for structured activity content
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer_index INTEGER,
    explanation TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_question_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS drag_drop_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL,
    text VARCHAR(255) NOT NULL,
    correct_category VARCHAR(100) NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dragdrop_item_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS drag_drop_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL,
    category_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    color_class VARCHAR(50),
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dragdrop_category_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matching_pairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL,
    left_text VARCHAR(255) NOT NULL,
    right_text VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_matching_pair_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lesson_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lesson_slide_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- 4. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_activity_id ON questions(activity_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(activity_id, order_index);

CREATE INDEX IF NOT EXISTS idx_dragdrop_items_activity_id ON drag_drop_items(activity_id);
CREATE INDEX IF NOT EXISTS idx_dragdrop_items_order ON drag_drop_items(activity_id, order_index);

CREATE INDEX IF NOT EXISTS idx_dragdrop_categories_activity_id ON drag_drop_categories(activity_id);
CREATE INDEX IF NOT EXISTS idx_dragdrop_categories_order ON drag_drop_categories(activity_id, order_index);

CREATE INDEX IF NOT EXISTS idx_matching_pairs_activity_id ON matching_pairs(activity_id);
CREATE INDEX IF NOT EXISTS idx_matching_pairs_order ON matching_pairs(activity_id, order_index);

CREATE INDEX IF NOT EXISTS idx_lesson_slides_lesson_id ON lesson_slides(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_slides_order ON lesson_slides(lesson_id, order_index);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema updated successfully!';
    RAISE NOTICE 'You can now restart your FiliUp application.';
END $$;
