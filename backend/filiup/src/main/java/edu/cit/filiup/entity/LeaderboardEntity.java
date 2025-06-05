package edu.cit.filiup.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "leaderboard")
public class LeaderboardEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID entryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private UserEntity student;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "ranking")
    private Integer rank;

    @Column(name = "category", nullable = false)
    @Enumerated(EnumType.STRING)
    private Category category;

    @Column(name = "time_frame", nullable = false)
    @Enumerated(EnumType.STRING)
    private TimeFrame timeFrame;

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;

    // New fields for quiz-specific metrics
    @Column(name = "accuracy_percentage")
    private Double accuracyPercentage;

    @Column(name = "average_time_minutes")
    private Double averageTimeMinutes;

    @Column(name = "total_quizzes_completed")
    private Integer totalQuizzesCompleted;

    @Column(name = "class_id")
    private UUID classId;

    @Column(name = "story_id")
    private UUID storyId;

    public enum Category {
        QUESTION_BANK,
        ASSIGNMENT,
        LESSON,
        PRACTICE,
        PROJECT,
        OVERALL,
        // New quiz-specific categories
        QUIZ_SCORE,
        QUIZ_ACCURACY,
        QUIZ_SPEED,
        QUIZ_COMPLETION_RATE,
        CLASS_QUIZ_PERFORMANCE,
        STORY_QUIZ_PERFORMANCE
    }

    public enum TimeFrame {
        DAILY,
        WEEKLY,
        MONTHLY,
        ALL_TIME
    }

    // Constructors
    public LeaderboardEntity() {
        this.lastUpdated = LocalDateTime.now();
    }

    public LeaderboardEntity(UserEntity student, Integer score, Category category, TimeFrame timeFrame) {
        this();
        this.student = student;
        this.score = score;
        this.category = category;
        this.timeFrame = timeFrame;
    }

    // Constructor for quiz-specific leaderboard entries
    public LeaderboardEntity(UserEntity student, Integer score, Category category, TimeFrame timeFrame,
                           Double accuracyPercentage, Double averageTimeMinutes, Integer totalQuizzesCompleted,
                           UUID classId, UUID storyId) {
        this(student, score, category, timeFrame);
        this.accuracyPercentage = accuracyPercentage;
        this.averageTimeMinutes = averageTimeMinutes;
        this.totalQuizzesCompleted = totalQuizzesCompleted;
        this.classId = classId;
        this.storyId = storyId;
    }

    // Getters and Setters
    public UUID getEntryId() {
        return entryId;
    }

    public void setEntryId(UUID entryId) {
        this.entryId = entryId;
    }

    public UserEntity getStudent() {
        return student;
    }

    public void setStudent(UserEntity student) {
        this.student = student;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public TimeFrame getTimeFrame() {
        return timeFrame;
    }

    public void setTimeFrame(TimeFrame timeFrame) {
        this.timeFrame = timeFrame;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public Double getAccuracyPercentage() {
        return accuracyPercentage;
    }

    public void setAccuracyPercentage(Double accuracyPercentage) {
        this.accuracyPercentage = accuracyPercentage;
    }

    public Double getAverageTimeMinutes() {
        return averageTimeMinutes;
    }

    public void setAverageTimeMinutes(Double averageTimeMinutes) {
        this.averageTimeMinutes = averageTimeMinutes;
    }

    public Integer getTotalQuizzesCompleted() {
        return totalQuizzesCompleted;
    }

    public void setTotalQuizzesCompleted(Integer totalQuizzesCompleted) {
        this.totalQuizzesCompleted = totalQuizzesCompleted;
    }

    public UUID getClassId() {
        return classId;
    }

    public void setClassId(UUID classId) {
        this.classId = classId;
    }

    public UUID getStoryId() {
        return storyId;
    }

    public void setStoryId(UUID storyId) {
        this.storyId = storyId;
    }
}
