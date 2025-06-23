-- Create badges table for defining available badge types
CREATE TABLE IF NOT EXISTS badges (
    badge_id UUID PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    criteria VARCHAR(1000),
    points_value INTEGER,
    image_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID,
    FOREIGN KEY (created_by) REFERENCES users (user_id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_badges_is_active ON badges (is_active);
CREATE INDEX idx_badges_created_by ON badges (created_by);
CREATE INDEX idx_badges_points_value ON badges (points_value);
CREATE INDEX idx_badges_title ON badges (title); 