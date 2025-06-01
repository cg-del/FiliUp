package edu.cit.filiup.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class EnrollmentResponseDTO {
    private UUID id;
    private UUID userId;
    private String classCode;
    private Boolean isAccepted;
    private LocalDateTime enrollmentDate;
    
    // Additional student information
    private String studentName;
    private String studentEmail;
    private String userProfilePictureUrl;
    private String section;
    private Double averageScore;
    private Integer numberOfQuizTakes;

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getClassCode() {
        return classCode;
    }

    public void setClassCode(String classCode) {
        this.classCode = classCode;
    }

    public Boolean getIsAccepted() {
        return isAccepted;
    }

    public void setIsAccepted(Boolean isAccepted) {
        this.isAccepted = isAccepted;
    }

    public LocalDateTime getEnrollmentDate() {
        return enrollmentDate;
    }

    public void setEnrollmentDate(LocalDateTime enrollmentDate) {
        this.enrollmentDate = enrollmentDate;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getUserProfilePictureUrl() {
        return userProfilePictureUrl;
    }

    public void setUserProfilePictureUrl(String userProfilePictureUrl) {
        this.userProfilePictureUrl = userProfilePictureUrl;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }

    public Integer getNumberOfQuizTakes() {
        return numberOfQuizTakes;
    }

    public void setNumberOfQuizTakes(Integer numberOfQuizTakes) {
        this.numberOfQuizTakes = numberOfQuizTakes;
    }
} 