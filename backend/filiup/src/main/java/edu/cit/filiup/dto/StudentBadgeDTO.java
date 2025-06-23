package edu.cit.filiup.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class StudentBadgeDTO {
    private UUID studentBadgeId;
    private UUID studentId;
    private UUID badgeId;
    private LocalDateTime badgeEarnedAt;
    private Double performanceScore;
    private String sourceType;
    private UUID sourceId;
    private BadgeDTO badge;

    // Constructors
    public StudentBadgeDTO() {}

    public StudentBadgeDTO(UUID studentBadgeId, UUID studentId, UUID badgeId, 
                          LocalDateTime badgeEarnedAt, BadgeDTO badge) {
        this.studentBadgeId = studentBadgeId;
        this.studentId = studentId;
        this.badgeId = badgeId;
        this.badgeEarnedAt = badgeEarnedAt;
        this.badge = badge;
    }

    // Getters and Setters
    public UUID getStudentBadgeId() {
        return studentBadgeId;
    }

    public void setStudentBadgeId(UUID studentBadgeId) {
        this.studentBadgeId = studentBadgeId;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public void setStudentId(UUID studentId) {
        this.studentId = studentId;
    }

    public UUID getBadgeId() {
        return badgeId;
    }

    public void setBadgeId(UUID badgeId) {
        this.badgeId = badgeId;
    }

    public LocalDateTime getBadgeEarnedAt() {
        return badgeEarnedAt;
    }

    public void setBadgeEarnedAt(LocalDateTime badgeEarnedAt) {
        this.badgeEarnedAt = badgeEarnedAt;
    }

    public Double getPerformanceScore() {
        return performanceScore;
    }

    public void setPerformanceScore(Double performanceScore) {
        this.performanceScore = performanceScore;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public UUID getSourceId() {
        return sourceId;
    }

    public void setSourceId(UUID sourceId) {
        this.sourceId = sourceId;
    }

    public BadgeDTO getBadge() {
        return badge;
    }

    public void setBadge(BadgeDTO badge) {
        this.badge = badge;
    }
} 