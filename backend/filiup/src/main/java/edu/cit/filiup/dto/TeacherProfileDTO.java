package edu.cit.filiup.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class TeacherProfileDTO {
    private UUID profileId;
    private UUID userId;
    private String userName;
    private String subjectArea;
    private String gradeLevelsTaught;
    private Integer teachingExperienceYears;
    private String educationBackground;
    private String certifications;
    private String specializations;
    private Integer totalStoriesCreated;
    private Integer totalQuizzesCreated;
    private Integer totalClassesManaged;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isActive;

    // Getters and Setters
    public UUID getProfileId() {
        return profileId;
    }

    public void setProfileId(UUID profileId) {
        this.profileId = profileId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getSubjectArea() {
        return subjectArea;
    }

    public void setSubjectArea(String subjectArea) {
        this.subjectArea = subjectArea;
    }

    public String getGradeLevelsTaught() {
        return gradeLevelsTaught;
    }

    public void setGradeLevelsTaught(String gradeLevelsTaught) {
        this.gradeLevelsTaught = gradeLevelsTaught;
    }

    public Integer getTeachingExperienceYears() {
        return teachingExperienceYears;
    }

    public void setTeachingExperienceYears(Integer teachingExperienceYears) {
        this.teachingExperienceYears = teachingExperienceYears;
    }

    public String getEducationBackground() {
        return educationBackground;
    }

    public void setEducationBackground(String educationBackground) {
        this.educationBackground = educationBackground;
    }

    public String getCertifications() {
        return certifications;
    }

    public void setCertifications(String certifications) {
        this.certifications = certifications;
    }

    public String getSpecializations() {
        return specializations;
    }

    public void setSpecializations(String specializations) {
        this.specializations = specializations;
    }

    public Integer getTotalStoriesCreated() {
        return totalStoriesCreated;
    }

    public void setTotalStoriesCreated(Integer totalStoriesCreated) {
        this.totalStoriesCreated = totalStoriesCreated;
    }

    public Integer getTotalQuizzesCreated() {
        return totalQuizzesCreated;
    }

    public void setTotalQuizzesCreated(Integer totalQuizzesCreated) {
        this.totalQuizzesCreated = totalQuizzesCreated;
    }

    public Integer getTotalClassesManaged() {
        return totalClassesManaged;
    }

    public void setTotalClassesManaged(Integer totalClassesManaged) {
        this.totalClassesManaged = totalClassesManaged;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
} 