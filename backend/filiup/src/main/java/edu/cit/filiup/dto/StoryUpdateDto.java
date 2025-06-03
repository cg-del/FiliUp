package edu.cit.filiup.dto;

import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for updating existing stories
 */
public class StoryUpdateDto {
    
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;
    
    private String content;
    
    private String genre;
    
    private String fictionType;
    
    private Long classId;
    
    private String coverPictureUrl;
    
    private Boolean isActive;
    
    // Default constructor
    public StoryUpdateDto() {
    }
    
    // Getters and setters
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
    
    public Long getClassId() {
        return classId;
    }
    
    public void setClassId(Long classId) {
        this.classId = classId;
    }
    
    public String getCoverPictureUrl() {
        return coverPictureUrl;
    }
    
    public void setCoverPictureUrl(String coverPictureUrl) {
        this.coverPictureUrl = coverPictureUrl;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
} 