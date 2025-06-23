-- Create student_badges table for tracking which badges students have earned
CREATE TABLE IF NOT EXISTS student_badges (
    student_badge_id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    badge_id UUID NOT NULL,
    earned_at TIMESTAMP NOT NULL,
    earned_from_quiz_id UUID NULL,
    earned_from_story_id UUID NULL,
    earned_from_class_id UUID NULL,
    performance_score DECIMAL(5,2) NULL,
    notes TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (student_id) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges (badge_id) ON DELETE CASCADE,
    FOREIGN KEY (earned_from_quiz_id) REFERENCES quizzes (quiz_id) ON DELETE SET NULL,
    FOREIGN KEY (earned_from_story_id) REFERENCES stories (story_id) ON DELETE SET NULL,
    FOREIGN KEY (earned_from_class_id) REFERENCES classes (class_id) ON DELETE SET NULL,
    UNIQUE(student_id, badge_id)
);

-- Create indexes for better performance
CREATE INDEX idx_student_badges_student_id ON student_badges (student_id);
CREATE INDEX idx_student_badges_badge_id ON student_badges (badge_id);
CREATE INDEX idx_student_badges_earned_at ON student_badges (earned_at);
CREATE INDEX idx_student_badges_is_active ON student_badges (is_active);

-- Insert default system badges
INSERT INTO badges (badge_id, title, description, criteria, points_value, is_active, created_at) VALUES
-- Performance Badges
(gen_random_uuid(), 'Perfect Quiz', 'Achieve 100% score on any quiz', 'Score 100% on a quiz', 50, true, NOW()),
(gen_random_uuid(), 'Quiz Excellence', 'Achieve 95% or higher on any quiz', 'Score 95% or higher on a quiz', 40, true, NOW()),
(gen_random_uuid(), 'High Achiever', 'Achieve 90% or higher on any quiz', 'Score 90% or higher on a quiz', 30, true, NOW()),
(gen_random_uuid(), 'Good Performance', 'Achieve 80% or higher on any quiz', 'Score 80% or higher on a quiz', 20, true, NOW()),

-- Speed Badges
(gen_random_uuid(), 'Speed Demon', 'Complete a quiz in 5 minutes or less', 'Complete any quiz in 5 minutes or less', 35, true, NOW()),
(gen_random_uuid(), 'Quick Thinker', 'Complete a quiz in 10 minutes or less', 'Complete any quiz in 10 minutes or less', 25, true, NOW()),

-- Streak Badges
(gen_random_uuid(), 'Streak Master', 'Achieve 3 consecutive good quiz scores', 'Score 80%+ on 3 consecutive quizzes', 45, true, NOW()),
(gen_random_uuid(), 'Consistency Champion', 'Achieve 5 consecutive good quiz scores', 'Score 80%+ on 5 consecutive quizzes', 60, true, NOW()),
(gen_random_uuid(), 'Unstoppable', 'Achieve 10 consecutive good quiz scores', 'Score 80%+ on 10 consecutive quizzes', 100, true, NOW()),

-- Improvement Badges
(gen_random_uuid(), 'Rising Star', 'Improve quiz performance by 20% or more', 'Show significant improvement in quiz performance', 40, true, NOW()),
(gen_random_uuid(), 'Improvement Master', 'Improve quiz performance by 30% or more', 'Show exceptional improvement in quiz performance', 55, true, NOW()),

-- Overall Performance Badges
(gen_random_uuid(), 'Top Performer', 'Maintain 85% average across 10+ quizzes', 'Consistently high performance across multiple quizzes', 75, true, NOW()),
(gen_random_uuid(), 'Quiz Veteran', 'Complete 5 or more quizzes', 'Complete at least 5 quizzes', 15, true, NOW()),
(gen_random_uuid(), 'Quiz Master', 'Complete 20 or more quizzes', 'Complete at least 20 quizzes', 50, true, NOW()); 