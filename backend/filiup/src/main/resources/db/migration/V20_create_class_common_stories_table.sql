CREATE TABLE IF NOT EXISTS class_common_stories (
    id UUID PRIMARY KEY,
    class_id UUID NOT NULL,
    story_id UUID NOT NULL,
    added_at TIMESTAMP NOT NULL,
    added_by UUID NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes (class_id) ON DELETE CASCADE,
    FOREIGN KEY (story_id) REFERENCES common_stories (story_id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users (user_id) ON DELETE CASCADE,
    UNIQUE (class_id, story_id)
); 