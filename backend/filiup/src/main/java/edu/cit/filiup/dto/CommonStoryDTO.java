package edu.cit.filiup.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class CommonStoryDTO {
    private UUID classId; // The class this story is associated with
    private String className; // The name of the class this story is associated with
    private UUID storyId;
    private String title;
    private String content;
    private String coverPictureUrl;
    private String coverPictureType;
    private LocalDateTime createdAt;
    private Boolean isActive;
    private String genre;
    private String fictionType;
    private String createdByUserName;

    // Getters and setters
    public UUID getClassId() { return classId; }
    public void setClassId(UUID classId) { this.classId = classId; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public UUID getStoryId() { return storyId; }
    public void setStoryId(UUID storyId) { this.storyId = storyId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getCoverPictureUrl() { return coverPictureUrl; }
    public void setCoverPictureUrl(String coverPictureUrl) { this.coverPictureUrl = coverPictureUrl; }
    public String getCoverPictureType() { return coverPictureType; }
    public void setCoverPictureType(String coverPictureType) { this.coverPictureType = coverPictureType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
    public String getFictionType() { return fictionType; }
    public void setFictionType(String fictionType) { this.fictionType = fictionType; }
    public String getCreatedByUserName() { return createdByUserName; }
    public void setCreatedByUserName(String createdByUserName) { this.createdByUserName = createdByUserName; }
} 