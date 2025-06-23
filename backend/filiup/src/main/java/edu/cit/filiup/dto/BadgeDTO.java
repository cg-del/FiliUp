package edu.cit.filiup.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class BadgeDTO {
    private UUID badgeId;
    private String title;
    private String description;
    private String criteria;
    private Integer pointsValue;
    private String imageUrl;
    private LocalDateTime createdAt;
    private Boolean isActive;
    private String createdByName;
    
    // Student-specific fields
    private Boolean isEarned = false;
    private LocalDateTime earnedAt;
    private Double performanceScore;
    private String earnedFromQuizTitle;
    private String earnedFromStoryTitle;
    private String earnedFromClassName;
    private String notes;

    // Constructors
    public BadgeDTO() {}

    public BadgeDTO(UUID badgeId, String title, String description, String criteria, 
                   Integer pointsValue, String imageUrl, Boolean isActive) {
        this.badgeId = badgeId;
        this.title = title;
        this.description = description;
        this.criteria = criteria;
        this.pointsValue = pointsValue;
        this.imageUrl = imageUrl;
        this.isActive = isActive;
    }

    // Getters and Setters
    public UUID getBadgeId() {
        return badgeId;
    }

    public void setBadgeId(UUID badgeId) {
        this.badgeId = badgeId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCriteria() {
        return criteria;
    }

    public void setCriteria(String criteria) {
        this.criteria = criteria;
    }

    public Integer getPointsValue() {
        return pointsValue;
    }

    public void setPointsValue(Integer pointsValue) {
        this.pointsValue = pointsValue;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public Boolean getIsEarned() {
        return isEarned;
    }

    public void setIsEarned(Boolean isEarned) {
        this.isEarned = isEarned;
    }

    public LocalDateTime getEarnedAt() {
        return earnedAt;
    }

    public void setEarnedAt(LocalDateTime earnedAt) {
        this.earnedAt = earnedAt;
    }

    public Double getPerformanceScore() {
        return performanceScore;
    }

    public void setPerformanceScore(Double performanceScore) {
        this.performanceScore = performanceScore;
    }

    public String getEarnedFromQuizTitle() {
        return earnedFromQuizTitle;
    }

    public void setEarnedFromQuizTitle(String earnedFromQuizTitle) {
        this.earnedFromQuizTitle = earnedFromQuizTitle;
    }

    public String getEarnedFromStoryTitle() {
        return earnedFromStoryTitle;
    }

    public void setEarnedFromStoryTitle(String earnedFromStoryTitle) {
        this.earnedFromStoryTitle = earnedFromStoryTitle;
    }

    public String getEarnedFromClassName() {
        return earnedFromClassName;
    }

    public void setEarnedFromClassName(String earnedFromClassName) {
        this.earnedFromClassName = earnedFromClassName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
} 