package edu.cit.filiup.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "teacher_profiles")
public class TeacherProfileEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID profileId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    @Column(name = "subject_area")
    private String subjectArea;

    @Column(name = "grade_levels_taught")
    private String gradeLevelsTaught;

    @Column(name = "teaching_experience_years")
    private Integer teachingExperienceYears;

    @Column(name = "education_background")
    private String educationBackground;

    @Column(name = "certifications")
    private String certifications;

    @Column(name = "specializations")
    private String specializations;

    @Column(name = "total_stories_created")
    private Integer totalStoriesCreated;

    @Column(name = "total_quizzes_created")
    private Integer totalQuizzesCreated;

    @Column(name = "total_classes_managed")
    private Integer totalClassesManaged;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    // Default constructor
    public TeacherProfileEntity() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isActive = true;
        this.totalStoriesCreated = 0;
        this.totalQuizzesCreated = 0;
        this.totalClassesManaged = 0;
    }

    // Getters and Setters
    public UUID getProfileId() {
        return profileId;
    }

    public void setProfileId(UUID profileId) {
        this.profileId = profileId;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
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