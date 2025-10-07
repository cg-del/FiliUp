-- Quick Fix: Make activities.content nullable
-- Copy and paste this into pgAdmin Query Tool and execute

ALTER TABLE activities ALTER COLUMN content DROP NOT NULL;

-- Add new columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='activities' AND column_name='title') THEN
        ALTER TABLE activities ADD COLUMN title VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='activities' AND column_name='instructions') THEN
        ALTER TABLE activities ADD COLUMN instructions TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='activities' AND column_name='story_text') THEN
        ALTER TABLE activities ADD COLUMN story_text TEXT;
    END IF;
END $$;

-- Success!
SELECT 'Database schema fixed successfully!' AS status;
