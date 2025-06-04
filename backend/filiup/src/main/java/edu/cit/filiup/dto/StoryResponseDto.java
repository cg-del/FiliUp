package edu.cit.filiup.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Data Transfer Object for story responses
 */
public class StoryResponseDTO {
    
    private UUID storyId;
    private String title;
    private String content;
    private String genre;
    private String fictionType;
    private String coverPictureUrl;
    private String coverPictureType;
    private LocalDateTime createdAt;
    private Boolean isActive;
    private UUID classId;
    private String className;
    private UUID createdById;
    private String createdByName;
    
    // Default constructor
    public StoryResponseDTO() {
    }
    
    // Constructor with all fields
    public StoryResponseDTO(UUID storyId, String title, String content, String genre, String fictionType, String coverPictureUrl,
                           String coverPictureType, LocalDateTime createdAt, Boolean isActive,
                           UUID classId, String className, UUID createdById, String createdByName) {
        this.storyId = storyId;
        this.title = title;
        this.content = content;
        this.genre = genre;
        this.fictionType = fictionType;
        this.coverPictureUrl = coverPictureUrl;
        this.coverPictureType = coverPictureType;
        this.createdAt = createdAt;
        this.isActive = isActive;
        this.classId = classId;
        this.className = className;
        this.createdById = createdById;
        this.createdByName = createdByName;
    }
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Retrieves the title of the story.
 *
 * @return the title of the story
 */

/*******  39d2b9e7-2d61-4422-adff-1c0fc4ca762c  *******/
  
    // Getters and setters
    public UUID getStoryId() {
        return storyId;
    }
    
    public void setStoryId(UUID storyId) {
        this.storyId = storyId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getGenre() {
        return genre;
    }
    
    public void setGenre(String genre) {
        this.genre = genre;
    }
    
    public String getFictionType() {
        return fictionType;
    }
    
    public void setFictionType(String fictionType) {
        this.fictionType = fictionType;
    }
    
    public String getCoverPictureUrl() {
        return coverPictureUrl;
    }
    
    public void setCoverPictureUrl(String coverPictureUrl) {
        this.coverPictureUrl = coverPictureUrl;
    }
    
    public String getCoverPictureType() {
        return coverPictureType;
    }
    
    public void setCoverPictureType(String coverPictureType) {
        this.coverPictureType = coverPictureType;
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
    
    public UUID getClassId() {
        return classId;
    }
    
    public void setClassId(UUID classId) {
        this.classId = classId;
    }
    
    public String getClassName() {
        return className;
    }
    
    public void setClassName(String className) {
        this.className = className;
    }
    
    public UUID getCreatedById() {
        return createdById;
    }
    
    public void setCreatedById(UUID createdById) {
        this.createdById = createdById;
    }
    
    public String getCreatedByName() {
        return createdByName;
    }
    
    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }
    
    
} 