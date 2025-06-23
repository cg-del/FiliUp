package edu.cit.filiup.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_badges")
public class StudentBadgeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID studentBadgeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private UserEntity student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id", nullable = false)
    private BadgeEntity badge;

    @Column(name = "earned_at", nullable = false)
    private LocalDateTime earnedAt;

    @Column(name = "earned_from_quiz_id")
    private UUID earnedFromQuizId;

    @Column(name = "earned_from_story_id")
    private UUID earnedFromStoryId;

    @Column(name = "earned_from_class_id")
    private UUID earnedFromClassId;

    @Column(name = "performance_score")
    private Double performanceScore;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Constructors
    public StudentBadgeEntity() {
        this.earnedAt = LocalDateTime.now();
    }

    public StudentBadgeEntity(UserEntity student, BadgeEntity badge, Double performanceScore) {
        this();
        this.student = student;
        this.badge = badge;
        this.performanceScore = performanceScore;
    }

    // Getters and Setters
    public UUID getStudentBadgeId() {
        return studentBadgeId;
    }

    public void setStudentBadgeId(UUID studentBadgeId) {
        this.studentBadgeId = studentBadgeId;
    }

    public UserEntity getStudent() {
        return student;
    }

    public void setStudent(UserEntity student) {
        this.student = student;
    }

    public BadgeEntity getBadge() {
        return badge;
    }

    public void setBadge(BadgeEntity badge) {
        this.badge = badge;
    }

    public LocalDateTime getEarnedAt() {
        return earnedAt;
    }

    public void setEarnedAt(LocalDateTime earnedAt) {
        this.earnedAt = earnedAt;
    }

    public UUID getEarnedFromQuizId() {
        return earnedFromQuizId;
    }

    public void setEarnedFromQuizId(UUID earnedFromQuizId) {
        this.earnedFromQuizId = earnedFromQuizId;
    }

    public UUID getEarnedFromStoryId() {
        return earnedFromStoryId;
    }

    public void setEarnedFromStoryId(UUID earnedFromStoryId) {
        this.earnedFromStoryId = earnedFromStoryId;
    }

    public UUID getEarnedFromClassId() {
        return earnedFromClassId;
    }

    public void setEarnedFromClassId(UUID earnedFromClassId) {
        this.earnedFromClassId = earnedFromClassId;
    }

    public Double getPerformanceScore() {
        return performanceScore;
    }

    public void setPerformanceScore(Double performanceScore) {
        this.performanceScore = performanceScore;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
} 