package edu.cit.filiup.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Data Transfer Object for uploading story cover images
 */
public class CoverImageUploadDto {
    
    @NotNull(message = "Story ID cannot be null")
    private Long storyId;
    
    private String imageUrl;
    
    private String imageType;
    
    // Default constructor
    public CoverImageUploadDto() {
    }
    
    // Constructor with required fields
    public CoverImageUploadDto(Long storyId) {
        this.storyId = storyId;
    }
    
    // Constructor with all fields
    public CoverImageUploadDto(Long storyId, String imageUrl, String imageType) {
        this.storyId = storyId;
        this.imageUrl = imageUrl;
        this.imageType = imageType;
    }
    
    // Getters and setters
    public Long getStoryId() {
        return storyId;
    }
    
    public void setStoryId(Long storyId) {
        this.storyId = storyId;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public String getImageType() {
        return imageType;
    }
    
    public void setImageType(String imageType) {
        this.imageType = imageType;
    }
} 